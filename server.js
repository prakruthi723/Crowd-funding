const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const Blockchain = require('./blockchain/blockchain');
const Transaction = require('./blockchain/transaction');

const app = express();
const PORT = 5000;

// Initialize blockchain
const crowdfundingBlockchain = new Blockchain();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./crowdfunding.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            goal_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            creator_address TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deadline DATETIME,
            status TEXT DEFAULT 'active'
        )
    `, (err) => {
        if (err) {
            console.error('Error creating projects table:', err);
        } else {
            // Add deadline column if it doesn't exist (migration)
            db.run(`
                ALTER TABLE projects ADD COLUMN deadline DATETIME
            `, (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Error adding deadline column:', err);
                }
            });
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            contributor_address TEXT NOT NULL,
            amount REAL NOT NULL,
            transaction_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS refunds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contribution_id INTEGER,
            project_id INTEGER,
            contributor_address TEXT NOT NULL,
            refund_amount REAL NOT NULL,
            transaction_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY (contribution_id) REFERENCES contributions (id),
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    `);
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all projects
app.get('/api/projects', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create new project
app.post('/api/projects', (req, res) => {
    const { title, description, goalAmount, creatorAddress, deadline } = req.body;

    if (!title || !description || !goalAmount || !creatorAddress) {
        return res.status(400).json({ error: 'Title, description, goal amount, and creator address are required' });
    }

    db.run(
        'INSERT INTO projects (title, description, goal_amount, creator_address, deadline) VALUES (?, ?, ?, ?, ?)',
        [title, description, goalAmount, creatorAddress, deadline || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Project created successfully' });
        }
    );
});

// Get project by ID
app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;

    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Get contributions for this project
        db.all('SELECT * FROM contributions WHERE project_id = ?', [projectId], (err, contributions) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Calculate unique donors
            const uniqueDonors = [...new Set(contributions.map(c => c.contributor_address))];

            // Check if deadline passed and goal not met (only if deadline exists)
            if (project.deadline) {
                const now = new Date();
                const deadline = new Date(project.deadline);
                const isExpired = now > deadline;
                const goalMet = project.current_amount >= project.goal_amount;

                // Auto-update status if needed
                if (isExpired && !goalMet && project.status === 'active') {
                    db.run('UPDATE projects SET status = ? WHERE id = ?', ['failed', projectId]);
                    project.status = 'failed';
                } else if (goalMet && project.status === 'active') {
                    db.run('UPDATE projects SET status = ? WHERE id = ?', ['funded', projectId]);
                    project.status = 'funded';
                }
            } else {
                // No deadline - just check if goal is met
                const goalMet = project.current_amount >= project.goal_amount;
                if (goalMet && project.status === 'active') {
                    db.run('UPDATE projects SET status = ? WHERE id = ?', ['funded', projectId]);
                    project.status = 'funded';
                }
            }

            res.json({
                ...project,
                contributions,
                donorCount: uniqueDonors.length,
                uniqueDonors: uniqueDonors
            });
        });
    });
});

// Fund a project
app.post('/api/projects/:id/fund', (req, res) => {
    const projectId = req.params.id;
    const { amount, contributorAddress, realTransactionHash } = req.body;
    
    if (!amount || !contributorAddress) {
        return res.status(400).json({ error: 'Amount and contributor address are required' });
    }
    
    // Get project details
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        
        // Create blockchain transaction
        const transaction = new Transaction(contributorAddress, project.creator_address, parseFloat(amount), 'funding', projectId);
        
        // Add transaction to blockchain
        crowdfundingBlockchain.addTransaction(transaction);
        
        // Mine the block
        crowdfundingBlockchain.minePendingTransactions('miner-address');
        
        // Update project funding amount
        const newAmount = project.current_amount + parseFloat(amount);
        
        db.run(
            'UPDATE projects SET current_amount = ? WHERE id = ?',
            [newAmount, projectId],
            (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                // Record contribution
                const transactionHashToStore = realTransactionHash || transaction.hash;
                
                db.run(
                    'INSERT INTO contributions (project_id, contributor_address, amount, transaction_hash) VALUES (?, ?, ?, ?)',
                    [projectId, contributorAddress, amount, transactionHashToStore],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        
                        res.json({ 
                            message: 'Funding successful',
                            transactionHash: transactionHashToStore,
                            realTransaction: !!realTransactionHash,
                            newAmount: newAmount
                        });
                    }
                );
            }
        );
    });
});

// Get blockchain info
app.get('/api/blockchain', (req, res) => {
    res.json({
        blocks: crowdfundingBlockchain.chain,
        isValid: crowdfundingBlockchain.isChainValid()
    });
});

// Request refund for a contribution
app.post('/api/projects/:id/refund', (req, res) => {
    const projectId = req.params.id;
    const { contributionId, refundAddress, realTransactionHash } = req.body;
    
    if (!contributionId || !refundAddress) {
        return res.status(400).json({ error: 'Contribution ID and refund address are required' });
    }
    
    // Get contribution details
    db.get('SELECT * FROM contributions WHERE id = ? AND project_id = ?', [contributionId, projectId], (err, contribution) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!contribution) {
            res.status(404).json({ error: 'Contribution not found' });
            return;
        }
        
        // Get project details
        db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Create refund blockchain transaction
            const refundTransaction = new Transaction(project.creator_address, refundAddress, contribution.amount, 'refund', projectId);
            
            // Add transaction to blockchain
            crowdfundingBlockchain.addTransaction(refundTransaction);
            
            // Mine the block
            crowdfundingBlockchain.minePendingTransactions('miner-address');
            
            // Update project funding amount
            const newAmount = Math.max(0, project.current_amount - contribution.amount);
            
            db.run(
                'UPDATE projects SET current_amount = ? WHERE id = ?',
                [newAmount, projectId],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    // Record refund
                    const transactionHashToStore = realTransactionHash || refundTransaction.hash;
                    
                    db.run(
                        'INSERT INTO refunds (contribution_id, project_id, contributor_address, refund_amount, transaction_hash) VALUES (?, ?, ?, ?, ?)',
                        [contributionId, projectId, refundAddress, contribution.amount, transactionHashToStore],
                        (err) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            
                            res.json({ 
                                message: 'Refund processed successfully',
                                transactionHash: transactionHashToStore,
                                realTransaction: !!realTransactionHash,
                                refundAmount: contribution.amount,
                                newProjectAmount: newAmount
                            });
                        }
                    );
                }
            );
        });
    });
});

// Get refunds for a project
app.get('/api/projects/:id/refunds', (req, res) => {
    const projectId = req.params.id;

    db.all('SELECT * FROM refunds WHERE project_id = ? ORDER BY created_at DESC', [projectId], (err, refunds) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(refunds);
    });
});

// Withdraw funds (creator only when goal is met)
app.post('/api/projects/:id/withdraw', (req, res) => {
    const projectId = req.params.id;
    const { creatorAddress, realTransactionHash } = req.body;

    if (!creatorAddress) {
        return res.status(400).json({ error: 'Creator address is required' });
    }

    // Get project details
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Verify creator
        if (project.creator_address.toLowerCase() !== creatorAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Only the creator can withdraw funds' });
        }

        // Check if goal is met
        if (project.current_amount < project.goal_amount) {
            return res.status(400).json({ error: 'Goal not reached yet. Cannot withdraw funds.' });
        }

        // Check if already withdrawn
        if (project.status === 'withdrawn') {
            return res.status(400).json({ error: 'Funds already withdrawn' });
        }

        // Create withdrawal blockchain transaction
        const withdrawalTransaction = new Transaction(
            'platform',
            creatorAddress,
            project.current_amount,
            'withdrawal',
            projectId
        );

        // Add transaction to blockchain
        crowdfundingBlockchain.addTransaction(withdrawalTransaction);

        // Mine the block
        crowdfundingBlockchain.minePendingTransactions('miner-address');

        // Update project status to withdrawn
        db.run(
            'UPDATE projects SET status = ? WHERE id = ?',
            ['withdrawn', projectId],
            (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                res.json({
                    message: 'Funds withdrawn successfully',
                    amount: project.current_amount,
                    transactionHash: realTransactionHash || withdrawalTransaction.hash,
                    realTransaction: !!realTransactionHash
                });
            }
        );
    });
});

// Auto-refund for failed campaigns
app.post('/api/projects/:id/auto-refund', (req, res) => {
    const projectId = req.params.id;

    // Get project details
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, project) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        // Check if deadline passed and goal not met
        const now = new Date();
        const deadline = new Date(project.deadline);
        const isExpired = now > deadline;
        const goalMet = project.current_amount >= project.goal_amount;

        if (!isExpired || goalMet) {
            return res.status(400).json({ error: 'Campaign is still active or goal was met' });
        }

        // Get all contributions that haven't been refunded
        db.all(
            `SELECT c.* FROM contributions c
             LEFT JOIN refunds r ON c.id = r.contribution_id
             WHERE c.project_id = ? AND r.id IS NULL`,
            [projectId],
            (err, contributions) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                if (contributions.length === 0) {
                    return res.json({ message: 'All contributions already refunded', refundCount: 0 });
                }

                // Process refunds for all contributors
                let refundCount = 0;
                let errors = [];

                contributions.forEach((contribution, index) => {
                    // Create refund blockchain transaction
                    const refundTransaction = new Transaction(
                        project.creator_address,
                        contribution.contributor_address,
                        contribution.amount,
                        'auto-refund',
                        projectId
                    );

                    // Add transaction to blockchain
                    crowdfundingBlockchain.addTransaction(refundTransaction);

                    // Record refund
                    db.run(
                        'INSERT INTO refunds (contribution_id, project_id, contributor_address, refund_amount, transaction_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [contribution.id, projectId, contribution.contributor_address, contribution.amount, refundTransaction.hash, 'completed'],
                        (err) => {
                            if (err) {
                                errors.push(err.message);
                            } else {
                                refundCount++;
                            }

                            // If this is the last contribution, send response
                            if (index === contributions.length - 1) {
                                // Mine all refund transactions
                                crowdfundingBlockchain.minePendingTransactions('miner-address');

                                // Update project status and reset current amount
                                db.run(
                                    'UPDATE projects SET status = ?, current_amount = 0 WHERE id = ?',
                                    ['refunded', projectId],
                                    (err) => {
                                        if (err) {
                                            res.status(500).json({ error: err.message });
                                            return;
                                        }

                                        res.json({
                                            message: `Auto-refund processed for ${refundCount} contributions`,
                                            refundCount: refundCount,
                                            errors: errors.length > 0 ? errors : null
                                        });
                                    }
                                );
                            }
                        }
                    );
                });
            }
        );
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});