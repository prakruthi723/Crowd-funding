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
            status TEXT DEFAULT 'active'
        )
    `);
    
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
    const { title, description, goalAmount, creatorAddress } = req.body;
    
    if (!title || !description || !goalAmount || !creatorAddress) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    db.run(
        'INSERT INTO projects (title, description, goal_amount, creator_address) VALUES (?, ?, ?, ?)',
        [title, description, goalAmount, creatorAddress],
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
            res.json({ ...project, contributions });
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