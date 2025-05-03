import yahooFinance from 'yahoo-finance2';
import { IterationType } from '../trading_objects/TradeStrategy.js';
import fs from 'fs'; // Import the fs module for file operations

import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'stock_db';

async function getStockData(tradeObject, startDate, endDate) {
    if (!tradeObject?.Ticker || !startDate || !endDate) {
        throw new Error('tradeObject with Ticker, startDate, and endDate are required');
    }

    const ticker = tradeObject.Ticker;
    const collectionName = `${ticker}_data`;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const query = {
        Date: { $gte: start, $lte: end }
    };

    const options = {
        sort: { Date: 1 },
        projection: { _id: 0 }
    };

    try {
        await client.connect();
        const results = await collection.find(query, options).toArray();
        return results;
    } catch (err) {
        console.error(`MongoDB query failed for ${ticker}:`, err);
        throw err;
    } finally {
        await client.close();
    }
}

export { getStockData };


async function getCurrentPrice(currenttime, shareName) {
    // get the current price of a stock using getStockData
    const FiveDaysAgo = new Date(currenttime.getTime() - 5 * 24 * 60 * 60 * 1000);
    const FiveDaysAhead = new Date(currenttime.getTime() + 5 * 24 * 60 * 60 * 1000);
    const stockData = await getStockData(shareName, FiveDaysAgo, FiveDaysAhead);
    // set currentTime to 13:30 but keep the date the same as currenttime
    currenttime = new Date(currenttime.getFullYear(), currenttime.getMonth(), currenttime.getDate(), 15, 30, 0, 0);
    let currentPrice = 0;

    const quotes = stockData.quotes;
    for (const quote of quotes) {
        if (new Date(quote.date).getTime() === currenttime.getTime()) {
            currentPrice = quote.close;
            break;
        }
    }

    if (!currentPrice) {
        // take the quote.close in the middle of the quotes array
        const middleIndex = Math.floor(quotes.length / 2);
        currentPrice = quotes[middleIndex].close;
        console.log('No current price available for the given date. Taking the middle price instead.');
    }

    return currentPrice; // Assuming you want the closing price
}

export { getCurrentPrice };
