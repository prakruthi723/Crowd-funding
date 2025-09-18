const crypto = require('crypto');

class Transaction {
    constructor(fromAddress, toAddress, amount, type = 'transfer', projectId = null) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.type = type; // 'transfer', 'funding', etc.
        this.projectId = projectId;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.fromAddress + 
                this.toAddress + 
                this.amount + 
                this.type + 
                this.projectId + 
                this.timestamp
            )
            .digest('hex');
    }

    isValid() {
        // Basic validation
        if (!this.fromAddress || !this.toAddress) return false;
        if (this.amount <= 0) return false;
        if (this.hash !== this.calculateHash()) return false;
        return true;
    }
}

module.exports = Transaction;