// Global variables
let currentProjects = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    setupFormHandlers();
    checkMetaMaskAvailability();
});

// Check MetaMask availability and show notice if not installed
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
        activeSection.insertBefore(notice, activeSection.firstChild);
    }
}

// Navigation functions
function showSection(event, sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load specific content based on section
    if (sectionName === 'projects') {
        loadProjects();
    } else if (sectionName === 'blockchain') {
        loadBlockchainInfo();
    }
}

// Load projects from API
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

// Display projects in grid
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

// Open project modal with details
async function openProjectModal(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();
        
        const progress = (project.current_amount / project.goal_amount) * 100;
        const progressCapped = Math.min(progress, 100);
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2>${escapeHtml(project.title)}</h2>
            <p style="color: #666; margin-bottom: 1rem;">Created by: ${project.creator_address}</p>
            <p style="margin-bottom: 2rem;">${escapeHtml(project.description)}</p>
            
            <div style="margin-bottom: 2rem;">
                <div class="progress-bar" style="height: 12px;">
                    <div class="progress-fill" style="width: ${progressCapped}%"></div>
                </div>
                <div class="project-stats" style="margin-top: 0.5rem;">
                    <span><strong>${project.current_amount || 0} ETH</strong> of <strong>${project.goal_amount} ETH</strong></span>
                    <span><strong>${progressCapped.toFixed(1)}%</strong> funded</span>
                </div>
            </div>
            
            ${project.contributions && project.contributions.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h4>Recent Contributions:</h4>
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
            ` : ''}
            
            <div class="funding-form">
                <h4>Fund this Project</h4>
                ${!window.ethereum ? `
                    <div class="metamask-notice" style="margin-bottom: 1rem;">
                        <strong>Note:</strong> MetaMask not detected. You can still fund with demo addresses, 
                        but no real blockchain transaction will occur.
                    </div>
                ` : ''}
                <form id="funding-form" onsubmit="fundProject(event, ${project.id})">
                    <div class="form-group">
                        <label for="funding-amount">Amount (ETH):</label>
                        <input type="number" id="funding-amount" step="0.001" min="0.001" required>
                    </div>
                    <div class="form-group">
                        <label for="contributor-address">Your Wallet Address:</label>
                        <input type="text" id="contributor-address" placeholder="0x..." required>
                        ${window.ethereum && metaMaskWallet.isConnected ? `
                            <small style="color: #666;">Connected wallet address will be auto-filled</small>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button type="submit" class="btn btn-success">
                            ${window.ethereum ? 'Fund with MetaMask' : 'Fund Project (Demo)'}
                        </button>
                        ${window.ethereum && !metaMaskWallet.isConnected ? `
                            <small style="color: #666;">Connect wallet for real transactions</small>
                        ` : ''}
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('project-modal').style.display = 'block';
        
        // Auto-fill wallet address if MetaMask is connected
        if (window.ethereum && metaMaskWallet.isConnected) {
            metaMaskWallet.autoFillWalletAddresses();
        }
    } catch (error) {
        console.error('Error loading project details:', error);
        showMessage('Error loading project details', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('project-modal').style.display = 'none';
}

// Fund project
async function fundProject(event, projectId) {
    event.preventDefault();
    
    const amount = document.getElementById('funding-amount').value;
    const contributorAddress = document.getElementById('contributor-address').value;
    
    if (!amount || !contributorAddress) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        let transactionHash = null;
        
        // If MetaMask is available and connected, send real transaction
        if (window.ethereum && metaMaskWallet.isConnected) {
            try {
                // Get project details to get creator address
                const projectResponse = await fetch(`/api/projects/${projectId}`);
                const project = await projectResponse.json();
                
                showMessage('Please confirm the transaction in MetaMask...', 'info');
                
                // Send real blockchain transaction
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
            loadProjects(); // Refresh projects list
        } else {
            showMessage(result.error || 'Error funding project', 'error');
        }
    } catch (error) {
        console.error('Error funding project:', error);
        showMessage('Error funding project', 'error');
    }
}

// Setup form handlers
function setupFormHandlers() {
    const createForm = document.getElementById('create-form');
    createForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const goalAmount = document.getElementById('goalAmount').value;
        const creatorAddress = document.getElementById('creatorAddress').value;
        
        // Validate Ethereum address format if MetaMask is available
        if (window.ethereum && !/^0x[a-fA-F0-9]{40}$/.test(creatorAddress)) {
            showMessage('Please enter a valid Ethereum address (0x...)', 'error');
            return;
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
                    creatorAddress
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showMessage('Project created successfully!', 'success');
                createForm.reset();
                // Switch to projects tab
                const projectsBtn = document.querySelector('.nav-btn[onclick*="projects"]');
                showSection({ target: projectsBtn }, 'projects');
                loadProjects(); // Refresh projects list
            } else {
                showMessage(result.error || 'Error creating project', 'error');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            showMessage('Error creating project', 'error');
        }
    });
}

// Load blockchain information
async function loadBlockchainInfo() {
    try {
        const response = await fetch('/api/blockchain');
        const blockchainData = await response.json();
        
        const blockchainInfo = document.getElementById('blockchain-info');
        blockchainInfo.innerHTML = `
            <div class="blockchain-info">
                <h3>Blockchain Status</h3>
                <p><strong>Chain Valid:</strong> ${blockchainData.isValid ? '✅ Yes' : '❌ No'}</p>
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

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 
    messageDiv.textContent = message;
    
    // Insert at top of current active section
    const activeSection = document.querySelector('.section.active');
    activeSection.insertBefore(messageDiv, activeSection.firstChild);
    
    // Auto remove after 5 seconds
    const timeout = type === 'info' ? 10000 : 5000;
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, timeout);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
        closeModal();
    }
});