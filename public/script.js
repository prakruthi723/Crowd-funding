let currentProjects = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    setupFormHandlers();
    checkMetaMaskAvailability();
});

function checkMetaMaskAvailability() {
    if (!window.ethereum) {
        const notice = document.createElement('div');
        notice.className = 'metamask-notice';
        notice.innerHTML = `
            <strong>MetaMask Not Detected!</strong><br>
            To use real blockchain transactions, please install
            <a href="https://metamask.io/" target="_blank">MetaMask</a> browser extension.
            You can still use the platform with demo addresses.
        `;

        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            activeSection.insertBefore(notice, activeSection.firstChild);
        }
    }
}

function showSection(event, sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (sectionName === 'projects') {
        loadProjects();
    } else if (sectionName === 'blockchain') {
        loadBlockchainInfo();
    }
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        currentProjects = projects;
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showMessage('Error loading projects', 'error');
    }
}

function displayProjects(projects) {
    const projectsList = document.getElementById('projects-list');

    if (projects.length === 0) {
        projectsList.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No projects found. Create the first one!</p>';
        return;
    }

    projectsList.innerHTML = projects.map(project => {
        const progress = (project.current_amount / project.goal_amount) * 100;
        const progressCapped = Math.min(progress, 100);

        return `
            <div class="project-card" onclick="openProjectModal(${project.id})">
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressCapped}%"></div>
                </div>
                <div class="project-stats">
                    <span><strong>${project.current_amount || 0} ETH</strong> raised</span>
                    <span>Goal: <strong>${project.goal_amount} ETH</strong></span>
                </div>
                <div class="project-stats">
                    <span>${progressCapped.toFixed(1)}% funded</span>
                    <span>Created: ${new Date(project.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function openProjectModal(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();

        const progress = (project.current_amount / project.goal_amount) * 100;
        const progressCapped = Math.min(progress, 100);

        let deadline, timeRemaining, daysRemaining, hoursRemaining, isExpired, timeRemainingText;

        if (project.deadline) {
            deadline = new Date(project.deadline);
            const now = new Date();
            timeRemaining = deadline - now;
            daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
            hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
            isExpired = timeRemaining <= 0;

            if (isExpired) {
                timeRemainingText = '<span style="color: #dc3545;">Expired</span>';
            } else if (daysRemaining > 0) {
                timeRemainingText = `<span style="color: #28a745;">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining</span>`;
            } else {
                timeRemainingText = `<span style="color: #ffc107;">${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} remaining</span>`;
            }
        } else {
            isExpired = false;
            timeRemainingText = '<span style="color: #6c757d;">No deadline set</span>';
        }

        const statusBadge = project.status === 'active' ? '<span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">Active</span>' :
            project.status === 'funded' ? '<span style="background: #007bff; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">Funded</span>' :
            project.status === 'withdrawn' ? '<span style="background: #6c757d; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">Withdrawn</span>' :
            project.status === 'failed' ? '<span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">Failed</span>' :
            project.status === 'refunded' ? '<span style="background: #ffc107; color: black; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">Refunded</span>' : '';

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h2 style="margin: 0;">${escapeHtml(project.title)}</h2>
                ${statusBadge}
            </div>

            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">Creator</p>
                        <p style="margin: 0.25rem 0 0 0; font-family: monospace; font-size: 0.85rem;">${project.creator_address.substring(0, 20)}...</p>
                    </div>
                    ${project.deadline ? `
                        <div>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">Deadline</p>
                            <p style="margin: 0.25rem 0 0 0;">${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString()}</p>
                        </div>
                    ` : ''}
                    ${project.deadline ? `
                        <div>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">Time Remaining</p>
                            <p style="margin: 0.25rem 0 0 0;">${timeRemainingText}</p>
                        </div>
                    ` : ''}
                    <div>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">Number of Donors</p>
                        <p style="margin: 0.25rem 0 0 0;"><strong>${project.donorCount || 0}</strong> donor${project.donorCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            <p style="margin-bottom: 2rem; line-height: 1.6;">${escapeHtml(project.description)}</p>

            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 0.5rem;">Funding Progress</h4>
                <div class="progress-bar" style="height: 12px;">
                    <div class="progress-fill" style="width: ${progressCapped}%"></div>
                </div>
                <div class="project-stats" style="margin-top: 0.5rem;">
                    <span><strong>${project.current_amount || 0} ETH</strong> raised of <strong>${project.goal_amount} ETH</strong></span>
                    <span><strong>${progressCapped.toFixed(1)}%</strong> funded</span>
                </div>
            </div>

            ${project.contributions && project.contributions.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h4>Donor Addresses (${project.donorCount}):</h4>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                        ${project.uniqueDonors.map(donor => `
                            <div style="font-family: monospace; font-size: 0.85rem; padding: 0.25rem 0;">${donor}</div>
                        `).join('')}
                    </div>

                    <h4 style="margin-top: 1.5rem;">Recent Contributions:</h4>
                    <div style="max-height: 200px; overflow-y: auto; margin-top: 1rem;">
                        ${project.contributions.slice(-5).reverse().map(contribution => `
                            <div class="transaction">
                                <strong>${contribution.amount} ETH</strong> from ${contribution.contributor_address.substring(0, 10)}...
                                <br><small>Transaction: ${contribution.transaction_hash || 'N/A'}</small>
                                <br><small>${new Date(contribution.created_at).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<p style="color: #666; text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">No contributions yet. Be the first to fund this project!</p>'}

            ${!isExpired && project.status === 'active' ? `
                <div class="funding-form">
                    <h4>Fund this Project</h4>
                    ${!window.ethereum ? `
                        <div class="metamask-notice" style="margin-bottom: 1rem;">
                            <strong>Note:</strong> MetaMask not detected. You can still fund with demo addresses,
                            but no real blockchain transaction will occur.
                        </div>
                    ` : ''}
                    <form id="funding-form" onsubmit="fundProject(event, ${project.id}); return false;">
                        <div class="form-group">
                            <label for="funding-amount">Amount (ETH):</label>
                            <input type="number" id="funding-amount" step="0.001" min="0.001" required>
                        </div>
                        <div class="form-group">
                            <label for="contributor-address">Your Wallet Address:</label>
                            <input type="text" id="contributor-address" placeholder="0x..." required>
                            ${window.ethereum && metaMaskWallet && metaMaskWallet.isConnected ? `
                                <small style="color: #666;">Connected wallet address will be auto-filled</small>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button type="submit" class="btn btn-success">
                                ${window.ethereum ? 'Fund with MetaMask' : 'Fund Project (Demo)'}
                            </button>
                            ${window.ethereum && metaMaskWallet && !metaMaskWallet.isConnected ? `
                                <small style="color: #666;">Connect wallet for real transactions</small>
                            ` : ''}
                        </div>
                    </form>
                </div>
            ` : ''}

            ${project.status === 'active' && window.ethereum && metaMaskWallet && metaMaskWallet.isConnected &&
              project.creator_address.toLowerCase() === metaMaskWallet.account.toLowerCase() &&
              project.current_amount > 0 ? `
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">
                    <h4>Creator Actions</h4>
                    <button onclick="withdrawFunds(${project.id}, '${project.creator_address}', ${project.current_amount})" class="btn btn-primary">
                        Withdraw ${project.current_amount} ETH
                    </button>
                </div>
            ` : ''}
        `;

        const modal = document.getElementById('project-modal');
        modal.style.display = 'block';

        if (window.ethereum && metaMaskWallet && metaMaskWallet.isConnected) {
            const contributorInput = document.getElementById('contributor-address');
            if (contributorInput) {
                contributorInput.value = metaMaskWallet.account;
            }
        }
    } catch (error) {
        console.error('Error opening project modal:', error);
        showMessage('Error loading project details', 'error');
    }
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
}

async function fundProject(event, projectId) {
    event.preventDefault();

    const amount = document.getElementById('funding-amount').value;
    const contributorAddress = document.getElementById('contributor-address').value;

    if (!contributorAddress || contributorAddress.trim() === '') {
        showMessage('Please enter a wallet address', 'error');
        return;
    }

    try {
        let transactionHash = null;

        if (window.ethereum && metaMaskWallet && metaMaskWallet.isConnected) {
            try {
                const project = currentProjects.find(p => p.id === projectId);
                if (!project) {
                    showMessage('Project not found', 'error');
                    return;
                }

                showMessage('Please confirm the transaction in MetaMask...', 'info');

                transactionHash = await metaMaskWallet.sendTransaction(
                    project.creator_address,
                    parseFloat(amount)
                );

                showMessage('Transaction sent! Waiting for confirmation...', 'info');
            } catch (metaMaskError) {
                console.error('MetaMask transaction failed:', metaMaskError);
                showMessage('MetaMask transaction failed: ' + metaMaskError.message, 'error');
                return;
            }
        }

        const response = await fetch(`/api/projects/${projectId}/fund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                contributorAddress: contributorAddress,
                realTransactionHash: transactionHash
            })
        });

        const result = await response.json();

        if (response.ok) {
            const message = transactionHash
                ? `Successfully funded with ${amount} ETH! Real transaction: ${transactionHash}`
                : `Successfully funded with ${amount} ETH! Demo transaction: ${result.transactionHash}`;
            showMessage(message, 'success');
            closeModal();
            loadProjects();
        } else {
            showMessage(result.error || 'Error funding project', 'error');
        }
    } catch (error) {
        console.error('Error funding project:', error);
        showMessage('Error funding project', 'error');
    }
}

async function withdrawFunds(projectId, creatorAddress, amount) {
    if (!window.ethereum || !metaMaskWallet || !metaMaskWallet.isConnected) {
        showMessage('Please connect MetaMask to withdraw funds', 'error');
        return;
    }

    const confirmWithdraw = confirm(`Are you sure you want to withdraw ${amount} ETH? This action cannot be undone.`);
    if (!confirmWithdraw) {
        return;
    }

    try {
        showMessage('Processing withdrawal...', 'info');

        const response = await fetch(`/api/projects/${projectId}/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                creatorAddress: metaMaskWallet.account
            })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`Successfully withdrew ${result.amount} ETH! Transaction: ${result.transactionHash}`, 'success');
            closeModal();
            loadProjects();
        } else {
            showMessage(result.error || 'Error withdrawing funds', 'error');
        }
    } catch (error) {
        console.error('Error withdrawing funds:', error);
        showMessage('Error withdrawing funds', 'error');
    }
}

function setupFormHandlers() {
    const createForm = document.getElementById('create-form');
    if (createForm) {
        createForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const goalAmount = document.getElementById('goalAmount').value;
            const creatorAddress = document.getElementById('creatorAddress').value;
            const deadline = document.getElementById('deadline').value;

            if (window.ethereum && !/^0x[a-fA-F0-9]{40}$/.test(creatorAddress)) {
                showMessage('Please enter a valid Ethereum address (0x...)', 'error');
                return;
            }

            let deadlineDate = null;
            if (deadline) {
                deadlineDate = new Date(deadline);
                const now = new Date();
                if (deadlineDate <= now) {
                    showMessage('Deadline must be in the future', 'error');
                    return;
                }
            }

            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        goalAmount: parseFloat(goalAmount),
                        creatorAddress,
                        deadline: deadlineDate ? deadlineDate.toISOString() : null
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('Project created successfully!', 'success');
                    createForm.reset();
                    const projectsBtn = document.querySelector('.nav-btn');
                    if (projectsBtn) {
                        showSection({ target: projectsBtn }, 'projects');
                    }
                    loadProjects();
                } else {
                    showMessage(result.error || 'Error creating project', 'error');
                }
            } catch (error) {
                console.error('Error creating project:', error);
                showMessage('Error creating project', 'error');
            }
        });
    }
}

async function loadBlockchainInfo() {
    try {
        const response = await fetch('/api/blockchain');
        const blockchainData = await response.json();

        const blockchainInfo = document.getElementById('blockchain-info');
        blockchainInfo.innerHTML = `
            <div class="blockchain-info">
                <h3>Blockchain Status</h3>
                <p><strong>Chain Valid:</strong> ${blockchainData.isValid ? 'Yes' : 'No'}</p>
                <p><strong>Total Blocks:</strong> ${blockchainData.blocks.length}</p>
            </div>

            <div>
                <h3>Recent Blocks</h3>
                ${blockchainData.blocks.slice(-5).reverse().map((block, index) => `
                    <div class="block">
                        <h4>Block #${blockchainData.blocks.length - index - 1}</h4>
                        <p><strong>Hash:</strong> ${block.hash}</p>
                        <p><strong>Previous Hash:</strong> ${block.previousHash}</p>
                        <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                        <p><strong>Nonce:</strong> ${block.nonce}</p>
                        <p><strong>Transactions:</strong> ${block.transactions.length}</p>

                        ${block.transactions.length > 0 ? `
                            <div style="margin-top: 1rem;">
                                <strong>Transactions:</strong>
                                ${block.transactions.map(tx => `
                                    <div class="transaction">
                                        <strong>${tx.type}:</strong> ${tx.amount} ETH
                                        <br><small>From: ${tx.fromAddress || 'System'}</small>
                                        <br><small>To: ${tx.toAddress}</small>
                                        ${tx.projectId ? `<br><small>Project ID: ${tx.projectId}</small>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading blockchain info:', error);
        showMessage('Error loading blockchain information', 'error');
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.success-message, .error-message, .info-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' :
                          type === 'info' ? 'info-message' : 'error-message';
    messageDiv.textContent = message;

    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
        activeSection.insertBefore(messageDiv, activeSection.firstChild);
    }

    const timeout = type === 'info' ? 10000 : 5000;
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, timeout);
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
        closeModal();
    }
});
