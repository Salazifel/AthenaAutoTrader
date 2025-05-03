import { getStockEntry } from '../stock_database/database.js';

class TradeObject {
    constructor(shareName) {
        if (!shareName || typeof shareName !== 'string') {
            throw new Error('A valid share name must be provided.');
        }

        try {
            const stockEntry = getStockEntry(shareName, 'stock');
            if (!stockEntry) {
                throw new Error(`Stock entry for ${shareName} not found.`);
            }
        } catch (error) {
            console.error('Error fetching stock entry:', error.message);
            throw new Error(`Failed to initialize TradeObject for ${shareName}.`);
        }

        this.shareName = shareName;
        this.historicalData = null; // Placeholder for historical data
    }

    getShareName() {
        return this.shareName;
    }

    setShareName(newShareName) {
        if (!newShareName || typeof newShareName !== 'string') {
            throw new Error('A valid share name must be provided.');
        }

        try {
            const stockEntry = getStockEntry(newShareName, 'stock');
            if (!stockEntry) {
                throw new Error(`Stock entry for ${newShareName} not found.`);
            }
        }
        catch (error) {
            console.error('Error fetching stock entry:', error.message);
            throw new Error(`Failed to set new share name to ${newShareName}.`);
        }

        this.shareName = newShareName;
    }

    setHistoricalData(historicalData) {
        this.historicalData = historicalData;
    }

    getHistoricalData() {
        if (!this.historicalData) {
            throw new Error('Historical data is not set.');
        }
        return this.historicalData;
    }
}

export default TradeObject;