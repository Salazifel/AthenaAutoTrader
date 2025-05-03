// import yahooFinance from 'yahoo-finance2';
// import { IterationType } from '../trading_objects/TradeStrategy.js';
// import fs from 'fs'; // Import the fs module for file operations
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://AthenaAutoTrader:hackUPC2025winner!@athena.4buv5xy.mongodb.net/";
const client = new MongoClient(uri);
const dbName = 'stock_db';

let isConnected = false;

async function getStockData(tradeObject, startDate, endDate) {
    if (!tradeObject || !startDate || !endDate) {
        throw new Error('tradeObject with Ticker, startDate, and endDate are required');
    }

    const ticker = tradeObject;
    const collectionName = `${ticker}_data`;

    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
        if (!isConnected) {
            await client.connect();
            isConnected = true;
        }

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const query = {
            Date: { $gte: start, $lte: end }
        };

        const options = {
            sort: { Date: 1 },
            projection: { _id: 0 }
        };

        const results = await collection.find(query, options).toArray();
        return results;
    } catch (err) {
        console.error(`MongoDB query failed for ${ticker}:`, err);
        throw err;
    }
}

async function closeConnection() {
    if (isConnected) {
        await client.close();
        isConnected = false;
        console.log('MongoDB connection closed.');
    }
}

// when ctrl +c is pressed, close the connection
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});

export { closeConnection };

export { getStockData };



async function getCurrentPrice(currenttime, shareName) {
    // get the current price of a stock using getStockData
    const FiveDaysAgo = new Date(currenttime.getTime() - 5 * 24 * 60 * 60 * 1000);
    const FiveDaysAhead = new Date(currenttime.getTime() + 5 * 24 * 60 * 60 * 1000);
    const stockData = await getStockData(shareName, FiveDaysAgo, FiveDaysAhead);
    // set currentTime to 13:30 but keep the date the same as currenttime
    currenttime = new Date(currenttime.getFullYear(), currenttime.getMonth(), currenttime.getDate(), 1, 0, 0, 0);
    let currentPrice = 0;

    for (const quote of stockData) {
        if (new Date(quote.Date).getTime() === currenttime.getTime()) {
            currentPrice = quote.Close;
            break;
        }
    }

    if (!currentPrice) {
        // take the quote.close in the middle of the quotes array
        const middleIndex = Math.floor(stockData.length / 2);
        currentPrice = stockData[middleIndex].Close;
        console.log('No current price available for the given date. Taking the middle price instead.');
    }

    return currentPrice; // Assuming you want the closing price
}

export { getCurrentPrice };
