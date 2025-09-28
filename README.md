# Blockchain Crowdfunding Platform

A comprehensive full-stack crowdfunding platform built with Node.js, Express, SQLite, and a custom blockchain implementation. This project demonstrates how to create a decentralized crowdfunding system with real MetaMask wallet integration, refunding capabilities, and minimal dependencies.

## 🚀 Features

### Core Functionality
- ✅ Create crowdfunding projects with detailed information
- ✅ Fund projects with real blockchain transactions via MetaMask
- ✅ **Refund System**: Request and process refunds for failed projects
- ✅ View project details and real-time funding progress
- ✅ Custom blockchain implementation with proof-of-work mining
- ✅ Complete transaction history and validation
- ✅ Responsive web interface with modern design
- ✅ SQLite database for persistent storage

### 🦊 MetaMask Integration
- ✅ **Real Wallet Connection**: Connect/disconnect MetaMask wallets seamlessly
- ✅ **Live Balance Display**: Shows current ETH balance in real-time
- ✅ **Actual ETH Transactions**: Send real Ethereum transactions on the blockchain
- ✅ **Multi-Network Support**: Works with Mainnet, Testnets, and Layer 2 networks
- ✅ **Account Management**: Automatic detection of account switches
- ✅ **Transaction Confirmation**: Native MetaMask transaction approval flow
- ✅ **Address Validation**: Smart Ethereum address format validation
- ✅ **Dual Mode Operation**: Seamlessly works with or without MetaMask

### 🔗 Blockchain Features
- ✅ **Custom Blockchain**: Built-from-scratch blockchain implementation
- ✅ **Proof of Work Mining**: Configurable difficulty mining algorithm
- ✅ **Transaction Validation**: Comprehensive transaction verification
- ✅ **Chain Integrity**: Full blockchain validation and tamper detection
- ✅ **Mining Rewards**: Automatic miner compensation system
- ✅ **Transaction Types**: Support for funding, refunding, and mining transactions

### 💰 Financial Features
- ✅ **Project Funding**: Support projects with ETH contributions
- ✅ **Refund System**: Request refunds for unsuccessful projects
- ✅ **Automatic Calculations**: Real-time funding progress tracking
- ✅ **Transaction History**: Complete audit trail of all transactions
- ✅ **Balance Management**: Track user balances and contributions

### 🎨 User Experience
- ✅ **Modern UI/UX**: Clean, responsive design with smooth animations
- ✅ **Real-time Updates**: Live project status and funding updates
- ✅ **Mobile Responsive**: Optimized for all device sizes
- ✅ **Error Handling**: Comprehensive error messages and validation
- ✅ **Loading States**: Clear feedback during transaction processing

## Tech Stack

**Backend:**
- Node.js (Runtime Environment)
- Express.js (Web Framework)
- SQLite3 (Database)
- Custom Blockchain Implementation
- Crypto Module (Hash Generation)

**Frontend:**
- Vanilla HTML5 (Structure)
- CSS3 with Modern Styling (Responsive Design)
- Vanilla JavaScript (ES6+) (Interactivity)
- MetaMask Web3 Integration (Blockchain Connectivity)

**Blockchain:**
- Custom Proof-of-Work Algorithm
- SHA-256 Hashing
- Transaction Validation
- Block Mining System

## Project Structure

```
blockchain-crowdfunding/
├── blockchain/
│   ├── blockchain.js      # Main blockchain class with mining
│   ├── block.js          # Block implementation with PoW
│   └── transaction.js    # Transaction implementation
├── public/
│   ├── index.html        # Main HTML with MetaMask integration
│   ├── styles.css        # Modern CSS with responsive design
│   ├── script.js         # Frontend JavaScript with Web3
│   └── metamask.js       # MetaMask integration utilities
├── server.js             # Express server with API endpoints
├── package.json          # Dependencies and scripts
├── crowdfunding.db       # SQLite database (auto-created)
└── README.md            # This comprehensive guide
```

## Installation & Setup

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MetaMask Browser Extension** (for real blockchain transactions)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Step-by-Step Installation

1. **Clone or download the project files to your local machine**

2. **Open terminal/command prompt and navigate to the project directory**
   ```bash
   cd blockchain-crowdfunding
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Install MetaMask (if not already installed)**
   - Visit [MetaMask.io](https://metamask.io/)
   - Install the browser extension
   - Create or import a wallet
   - Add some test ETH (use faucets for testnets)

6. **Open your web browser and visit**
   ```
   http://localhost:5000
   ```

## 🎯 How to Use the Platform

### 🦊 Connecting MetaMask

1. **Install MetaMask**: Download and install the MetaMask browser extension
2. **Create/Import Wallet**: Set up your Ethereum wallet
3. **Connect to Platform**: Click "Connect Wallet" button in the header
4. **Approve Connection**: Confirm the connection in MetaMask popup
5. **View Balance**: Your ETH balance will display in the header

### 📝 Creating a Project

1. Click on **"Create Project"** in the navigation
2. Fill in the project details:
   - **Title**: Catchy name for your project
   - **Description**: Detailed explanation of your project goals
   - **Funding Goal**: Target amount in ETH (e.g., 1.5 ETH)
   - **Wallet Address**: Your Ethereum address (auto-filled if MetaMask connected)
3. Click **"Create Project"**
4. Project appears in the main projects list

### 💰 Funding a Project

1. Navigate to the **"Projects"** section
2. Click on any project card to open detailed view
3. Review project information and funding progress
4. Scroll to **"Fund this Project"** section
5. Enter funding details:
   - **Amount**: Contribution amount in ETH (e.g., 0.1 ETH)
   - **Wallet Address**: Your address (auto-filled with MetaMask)
6. Click **"Fund Project"**
7. **With MetaMask**: Confirm transaction in MetaMask popup
8. **Without MetaMask**: Creates demo transaction for testing
9. Transaction is processed and added to blockchain

### 🔄 Requesting Refunds

1. Open a project you've contributed to
2. Scroll to the **"Request Refund"** section (appears for contributors)
3. Select the contribution you want to refund
4. Click **"Request Refund"**
5. **With MetaMask**: Confirm refund transaction
6. **Without MetaMask**: Creates demo refund transaction
7. Refund is processed and ETH returned to your wallet

### 📊 Viewing Blockchain Information

1. Click on **"Blockchain Info"** in the navigation
2. View comprehensive blockchain data:
   - **Chain Validity**: Verification status of the entire chain
   - **Total Blocks**: Number of blocks mined
   - **Recent Blocks**: Latest blocks with transaction details
   - **Mining Information**: Difficulty, nonces, and timestamps
   - **Transaction History**: All funding and refund transactions

## 🔧 How the Blockchain Works

### Basic Concepts

1. **Transactions**: Every funding/refunding action creates a blockchain transaction
2. **Blocks**: Transactions are grouped into blocks for processing
3. **Mining**: Blocks are mined using proof-of-work algorithm (difficulty: 2)
4. **Chain**: Blocks are cryptographically linked using SHA-256 hashes
5. **Validation**: Each transaction and block is validated before acceptance

### Mining Process

- **Difficulty Level**: Set to 2 (requires hash starting with "00")
- **Proof of Work**: Miners find valid nonce values through computation
- **Block Reward**: Miners receive 10 ETH for successfully mining blocks
- **Automatic Mining**: Mining occurs automatically when transactions are added
- **Hash Linking**: Each block contains the hash of the previous block

### Security Features

- **Cryptographic Hashing**: SHA-256 ensures data integrity
- **Chain Validation**: Entire blockchain can be verified for tampering
- **Transaction Validation**: All transactions validated before inclusion
- **Immutable Records**: Once mined, transactions cannot be altered
- **Consensus Mechanism**: Proof-of-work ensures network agreement

## 🌐 API Endpoints

### Projects Management
- `GET /api/projects` - Retrieve all projects with funding status
- `POST /api/projects` - Create new crowdfunding project
- `GET /api/projects/:id` - Get detailed project information with contributions
- `PUT /api/projects/:id/status` - Update project status (active/completed/failed)

### Funding Operations
- `POST /api/projects/:id/fund` - Fund a specific project with ETH
- `POST /api/projects/:id/refund` - Request refund for project contribution
- `GET /api/projects/:id/contributions` - Get all contributions for a project

### Blockchain Information
- `GET /api/blockchain` - Get complete blockchain data and validation status
- `GET /api/blockchain/balance/:address` - Get balance for specific address
- `GET /api/transactions/:address` - Get transaction history for address

### MetaMask Integration
- `POST /api/verify-transaction` - Verify MetaMask transaction on blockchain
- `GET /api/network-info` - Get supported network information

## 🗄️ Database Schema

### Projects Table
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    creator_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    deadline DATETIME,
    category TEXT DEFAULT 'general'
);
```

### Contributions Table
```sql
CREATE TABLE contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    contributor_address TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_hash TEXT,
    transaction_type TEXT DEFAULT 'funding',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

### Refunds Table
```sql
CREATE TABLE refunds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contribution_id INTEGER,
    refund_amount REAL NOT NULL,
    refund_address TEXT NOT NULL,
    transaction_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (contribution_id) REFERENCES contributions (id)
);
```

## ⚙️ Configuration & Customization

### Blockchain Configuration

#### Mining Difficulty
```javascript
// In blockchain/blockchain.js
constructor() {
    this.difficulty = 3; // Increase for harder mining (more security)
}
```

#### Mining Reward
```javascript
// In blockchain/blockchain.js
constructor() {
    this.miningReward = 50; // Change reward amount in ETH
}
```

#### Block Size Limit
```javascript
// In blockchain/blockchain.js
minePendingTransactions(miningRewardAddress) {
    // Limit transactions per block
    const transactionsToMine = this.pendingTransactions.slice(0, 10);
}
```

### Frontend Customization

#### Color Scheme
```css
/* In public/styles.css */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --error-color: #dc3545;
}
```

#### Network Configuration
```javascript
// In public/metamask.js
const SUPPORTED_NETWORKS = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0x89': 'Polygon Mainnet'
};
```

### Server Configuration

#### Port Settings
```javascript
// In server.js
const PORT = process.env.PORT || 5000;
```

#### Database Path
```javascript
// In server.js
const db = new sqlite3.Database('./data/crowdfunding.db');
```

## 🔒 Security Considerations

### Production Deployment Checklist

⚠️ **Important**: This is a demonstration project. For production use, implement these security measures:

#### Authentication & Authorization
- [ ] Implement user authentication system
- [ ] Add role-based access control
- [ ] Secure API endpoints with JWT tokens
- [ ] Add rate limiting to prevent abuse

#### Input Validation & Sanitization
- [ ] Validate all user inputs server-side
- [ ] Sanitize data before database insertion
- [ ] Implement SQL injection protection
- [ ] Add XSS protection headers

#### Network Security
- [ ] Use HTTPS in production
- [ ] Implement CORS properly
- [ ] Add DDoS protection
- [ ] Use environment variables for sensitive data

#### Smart Contract Integration
- [ ] Deploy actual smart contracts for fund management
- [ ] Implement automated refund mechanisms
- [ ] Add multi-signature wallet support
- [ ] Integrate with established DeFi protocols

#### Monitoring & Logging
- [ ] Add comprehensive error logging
- [ ] Implement transaction monitoring
- [ ] Add performance metrics
- [ ] Set up alerting systems

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### MetaMask Connection Issues
**Problem**: "MetaMask not detected" error
**Solution**: 
- Ensure MetaMask extension is installed and enabled
- Refresh the page after installing MetaMask
- Check if MetaMask is unlocked

**Problem**: Transaction fails in MetaMask
**Solution**:
- Check if you have sufficient ETH for gas fees
- Verify you're on the correct network
- Try increasing gas limit manually

#### Server Issues
**Problem**: Port already in use
**Solution**:
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# Or change port in server.js
```

**Problem**: Database errors
**Solution**:
```bash
# Delete database file and restart
rm crowdfunding.db
npm start
```

#### Frontend Issues
**Problem**: Projects not loading
**Solution**:
- Check browser console for JavaScript errors
- Verify server is running on correct port
- Clear browser cache and cookies

**Problem**: Styling issues on mobile
**Solution**:
- Check viewport meta tag is present
- Verify CSS media queries are working
- Test on different devices/browsers

### Development Tips

#### Testing with Testnets
1. Switch MetaMask to Goerli or Sepolia testnet
2. Get free test ETH from faucets:
   - [Goerli Faucet](https://goerlifaucet.com/)
   - [Sepolia Faucet](https://sepoliafaucet.com/)
3. Test all functionality with test ETH

#### Debugging Blockchain Issues
```javascript
// Add logging to blockchain operations
console.log('Mining block with difficulty:', this.difficulty);
console.log('Transaction hash:', transaction.hash);
console.log('Block mined:', block.hash);
```

#### Performance Optimization
- Use database indexes for frequently queried fields
- Implement pagination for large project lists
- Cache blockchain data for faster loading
- Optimize images and assets

## 🚀 Future Enhancements

### Planned Features
- [ ] **Smart Contract Integration**: Deploy on Ethereum mainnet
- [ ] **Multi-token Support**: Accept various ERC-20 tokens
- [ ] **Project Categories**: Organize projects by type
- [ ] **User Profiles**: Complete user management system
- [ ] **Project Updates**: Allow creators to post updates
- [ ] **Milestone Funding**: Release funds based on milestones
- [ ] **Governance System**: Community voting on disputes
- [ ] **Mobile App**: React Native mobile application

### Advanced Features
- [ ] **NFT Rewards**: Issue NFTs to contributors
- [ ] **Staking Mechanism**: Stake tokens for platform governance
- [ ] **Cross-chain Support**: Support multiple blockchains
- [ ] **DeFi Integration**: Yield farming for project funds
- [ ] **Oracle Integration**: Real-world data for project validation
- [ ] **Layer 2 Solutions**: Reduce transaction costs

### Business Features
- [ ] **KYC/AML Integration**: Identity verification
- [ ] **Fiat On-ramps**: Credit card payments
- [ ] **Tax Reporting**: Generate tax documents
- [ ] **Analytics Dashboard**: Detailed project analytics
- [ ] **Marketing Tools**: Social media integration
- [ ] **API for Third-parties**: External integrations

## 📚 Learning Resources

### Blockchain Development
- [Ethereum Documentation](https://ethereum.org/developers/)
- [Solidity Programming](https://docs.soliditylang.org/)
- [Web3.js Guide](https://web3js.readthedocs.io/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

### Full-Stack Development
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [Modern JavaScript](https://javascript.info/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [Web3 Security](https://blog.openzeppelin.com/security-audits/)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for changes
- Ensure all tests pass before submitting

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **MetaMask Team** for excellent Web3 integration tools
- **Ethereum Foundation** for blockchain infrastructure
- **Node.js Community** for robust backend framework
- **SQLite Team** for lightweight database solution
- **Open Source Community** for inspiration and resources

---

**Built with ❤️ by the Blockchain Crowdfunding Team**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-username/blockchain-crowdfunding) or contact us at [your-email@example.com](mailto:your-email@example.com).