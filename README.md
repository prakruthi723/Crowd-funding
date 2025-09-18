# Blockchain Crowdfunding Platform

A simple full-stack crowdfunding platform built with Node.js, Express, SQLite, and a basic blockchain implementation. This project demonstrates how to create a decentralized crowdfunding system with minimal dependencies.

## Features

- ✅ Create crowdfunding projects
- ✅ Fund projects with blockchain transactions
- ✅ View project details and funding progress
- ✅ Basic blockchain implementation with mining
- ✅ Transaction history and validation
- ✅ Responsive web interface
- ✅ SQLite database for persistent storage

## Tech Stack

**Backend:**
- Node.js
- Express.js
- SQLite3
- Custom Blockchain Implementation

**Frontend:**
- Vanilla HTML5
- CSS3 with modern styling
- Vanilla JavaScript (ES6+)

## Project Structure

```
blockchain-crowdfunding/
├── blockchain/
│   ├── blockchain.js      # Main blockchain class
│   ├── block.js          # Block implementation
│   └── transaction.js    # Transaction implementation
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styling
│   └── script.js         # Frontend JavaScript
├── server.js             # Express server
├── package.json          # Dependencies
├── crowdfunding.db       # SQLite database (auto-created)
└── README.md            # This file
```

## Installation & Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

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
   
   Or for development:
   ```bash
   npm run dev
   ```

5. **Open your web browser and visit**
   ```
   http://localhost:3000
   ```

## How to Use the Platform

### Creating a Project

1. Click on **"Create Project"** in the navigation
2. Fill in the project details:
   - **Title**: Name of your project
   - **Description**: Detailed description of what you're funding
   - **Funding Goal**: Amount you want to raise (in ETH)
   - **Wallet Address**: Your blockchain wallet address (can be any string for demo)
3. Click **"Create Project"**

### Funding a Project

1. Go to the **"Projects"** section
2. Click on any project card to open its details
3. Scroll down to the **"Fund this Project"** section
4. Enter:
   - **Amount**: How much you want to contribute (in ETH)
   - **Wallet Address**: Your wallet address (can be any string for demo)
5. Click **"Fund Project"**
6. The transaction will be added to the blockchain and mined

### Viewing Blockchain Information

1. Click on **"Blockchain Info"** in the navigation
2. View:
   - Chain validity status
   - Total number of blocks
   - Recent blocks with their details
   - All transactions within each block

## How the Blockchain Works

### Basic Concepts

1. **Transactions**: When someone funds a project, a transaction is created
2. **Blocks**: Transactions are grouped into blocks
3. **Mining**: Blocks are mined using a proof-of-work algorithm (simplified)
4. **Chain**: Blocks are linked together using cryptographic hashes

### Mining Process

- Each block requires mining with a difficulty level of 2
- Mining involves finding a hash that starts with "00"
- Miners receive a reward of 10 ETH for successfully mining a block
- The mining process is automatic when transactions are added

### Security Features

- Each block contains the hash of the previous block
- Transactions are validated before being added to blocks
- The entire chain can be validated for integrity
- Hash-based linking prevents tampering

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details with contributions

### Funding
- `POST /api/projects/:id/fund` - Fund a specific project

### Blockchain
- `GET /api/blockchain` - Get blockchain information and blocks

## Database Schema

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
    status TEXT DEFAULT 'active'
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
```

## Customization

### Changing Mining Difficulty
In `blockchain/blockchain.js`, modify the `difficulty` property:
```javascript
constructor() {
    this.difficulty = 3; // Increase for harder mining
}
```

### Changing Mining Reward
In `blockchain/blockchain.js`, modify the `miningReward` property:
```javascript
constructor() {
    this.miningReward = 50; // Change reward amount
}
```

### Styling Customization
Edit `public/styles.css` to change:
- Color scheme
- Layout
- Animations
- Responsive breakpoints

## Development Notes

### Dependencies Explained

1. **express**: Web server framework
2. **sqlite3**: Database for storing projects and contributions
3. **crypto**: Node.js built-in module for hash generation

### Why These Technologies?

- **SQLite**: Lightweight, no setup required, perfect for demos
- **Vanilla JavaScript**: No build process, runs directly in browser
- **Express**: Minimal and fast web framework
- **Custom Blockchain**: Educational and fully controllable

### Security Considerations

⚠️ **Important**: This is a demonstration project and should NOT be used in production without significant security improvements:

1. Add proper wallet integration (MetaMask, etc.)
2. Implement real cryptocurrency transactions
3. Add user authentication and authorization
4. Implement proper input validation and sanitization
5. Add rate limiting and DDoS protection
6. Use HTTPS in production
7. Implement proper error handling and logging

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT variable in `server.js`
   - Or kill the process using port 3000

2. **Database errors**
   - Delete `crowdfunding.db` file and restart the server
   - The database will be recreated automatically

3. **NPM installation fails**
   - Make sure you have Node.js 14+ installed
   - Try `npm cache clean --force` and reinstall

4. **Page not loading**
   - Check if server is running on http://localhost:3000
   - Check browser console for JavaScript errors

### Getting Help

- Check the browser console for JavaScript errors
- Check the terminal for server errors
- Make sure all files are in the correct locations as shown in the project structure

## Future Enhancements

- Add user profiles and authentication
- Implement project categories and search
- Add project images and media support
- Implement smart contracts for automated fund release
- Add email notifications
- Implement project updates and communication features
- Add mobile app support
- Implement real cryptocurrency integration

## License

This project is open source and available under the MIT License.# crowd-funding-website
# crowd-funding-app
