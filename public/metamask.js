// MetaMask integration utilities
class MetaMaskWallet {
    constructor() {
        this.account = null;
        this.web3 = null;
        this.isConnected = false;
    }

    // Check if MetaMask is installed
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    // Connect to MetaMask
    async connect() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please unlock MetaMask.');
            }

            this.account = accounts[0];
            this.isConnected = true;

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.account = accounts[0];
                    this.updateUI();
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            this.updateUI();
            return this.account;
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            throw error;
        }
    }

    // Disconnect from MetaMask
    disconnect() {
        this.account = null;
        this.isConnected = false;
        this.updateUI();
    }

    // Get current account
    async getCurrentAccount() {
        if (!this.isMetaMaskInstalled()) {
            return null;
        }

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_accounts'
            });
            
            if (accounts.length > 0) {
                this.account = accounts[0];
                this.isConnected = true;
                return this.account;
            }
        } catch (error) {
            console.error('Error getting current account:', error);
        }
        
        return null;
    }

    // Get account balance
    async getBalance() {
        if (!this.account) {
            throw new Error('No account connected');
        }

        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [this.account, 'latest']
            });

            // Convert from wei to ether
            return parseFloat(parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    // Send transaction
    async sendTransaction(to, amount) {
        if (!this.account) {
            throw new Error('No account connected');
        }

        try {
            // Convert amount to wei
            const amountWei = '0x' + (amount * Math.pow(10, 18)).toString(16);

            const transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: this.account,
                    to: to,
                    value: amountWei,
                    gas: '0x5208', // 21000 gas limit for simple transfer
                }]
            });

            return transactionHash;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error;
        }
    }

    // Get network information
    async getNetworkInfo() {
        try {
            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });

            const networks = {
                '0x1': 'Ethereum Mainnet',
                '0x3': 'Ropsten Testnet',
                '0x4': 'Rinkeby Testnet',
                '0x5': 'Goerli Testnet',
                '0x2a': 'Kovan Testnet',
                '0x89': 'Polygon Mainnet',
                '0x13881': 'Polygon Mumbai Testnet'
            };

            return {
                chainId: chainId,
                networkName: networks[chainId] || 'Unknown Network'
            };
        } catch (error) {
            console.error('Error getting network info:', error);
            return null;
        }
    }

    // Update UI elements
    updateUI() {
        const connectBtn = document.getElementById('connect-wallet-btn');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const walletBalance = document.getElementById('wallet-balance');

        if (this.isConnected && this.account) {
            connectBtn.textContent = 'Disconnect Wallet';
            connectBtn.classList.remove('btn-primary');
            connectBtn.classList.add('btn-secondary');
            
            walletInfo.style.display = 'block';
            walletAddress.textContent = `${this.account.substring(0, 6)}...${this.account.substring(38)}`;
            
            // Update balance
            this.getBalance().then(balance => {
                walletBalance.textContent = `${balance} ETH`;
            }).catch(error => {
                walletBalance.textContent = 'Error loading balance';
            });

            // Auto-fill wallet addresses in forms
            this.autoFillWalletAddresses();
            
            // Update modal funding form UI
            this.updateFundingFormUI();
        } else {
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.classList.remove('btn-secondary');
            connectBtn.classList.add('btn-primary');
            
            walletInfo.style.display = 'none';
            
            // Update modal funding form UI
            this.updateFundingFormUI();
        }
    }

    // Update funding form UI when connection status changes
    updateFundingFormUI() {
        // Update metamask notice
        const metamaskNoticeContainer = document.getElementById('metamask-notice-container');
        if (metamaskNoticeContainer) {
            if (!window.ethereum) {
                metamaskNoticeContainer.innerHTML = `
                    <div class="metamask-notice" style="margin-bottom: 1rem;">
                        <strong>Note:</strong> MetaMask not detected. You can still fund with demo addresses.
                    </div>
                `;
            } else {
                metamaskNoticeContainer.innerHTML = '';
            }
        }

        // Update wallet status
        const walletStatusContainer = document.getElementById('wallet-status-container');
        if (walletStatusContainer) {
            if (this.isConnected) {
                walletStatusContainer.innerHTML = `<small style="color: #666;">Connected wallet address will be auto-filled</small>`;
            } else {
                walletStatusContainer.innerHTML = '';
            }
        }

        // Update demo transaction checkbox
        const demoTransactionContainer = document.getElementById('demo-transaction-container');
        if (demoTransactionContainer) {
            if (this.isConnected && window.ethereum) {
                demoTransactionContainer.innerHTML = `
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="use-fake-transaction" style="width: auto;">
                            <span>Use Demo Transaction (faster, no gas fees)</span>
                        </label>
                        <small style="color: #666;">Check this to create a demo transaction instead of a real blockchain transaction</small>
                    </div>
                `;
            } else {
                demoTransactionContainer.innerHTML = '';
            }
        }

        // Auto-fill contributor address if modal is open
        const contributorInput = document.getElementById('contributor-address');
        if (contributorInput && this.isConnected && !contributorInput.value) {
            contributorInput.value = this.account;
        }
    }

    // Auto-fill wallet addresses in forms
    autoFillWalletAddresses() {
        const creatorAddressInput = document.getElementById('creatorAddress');
        const contributorAddressInput = document.getElementById('contributor-address');

        if (creatorAddressInput && !creatorAddressInput.value) {
            creatorAddressInput.value = this.account;
        }

        if (contributorAddressInput && !contributorAddressInput.value) {
            contributorAddressInput.value = this.account;
        }
    }
}

// Global MetaMask wallet instance
const metaMaskWallet = new MetaMaskWallet();

// Initialize MetaMask on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if already connected
    await metaMaskWallet.getCurrentAccount();
    
    // Setup connect button handler
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', async function() {
            if (metaMaskWallet.isConnected) {
                metaMaskWallet.disconnect();
            } else {
                try {
                    await metaMaskWallet.connect();
                    showMessage('Wallet connected successfully!', 'success');
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            }
        });
    }
});