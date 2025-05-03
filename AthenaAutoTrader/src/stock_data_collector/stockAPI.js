// import yahooFinance from 'yahoo-finance2';
// import { IterationType } from '../trading_objects/TradeStrategy.js';
// import fs from 'fs'; // Import the fs module for file operations


async function getStockData(tradeObject, startDate, endDate) {
    if (!tradeObject || !startDate || !endDate) {
        throw new Error('tradeObject, startDate, and endDate are required');
    }

    try {
        const url = `http://localhost:3000/api/stock?symbol=${encodeURIComponent(tradeObject)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const payload = await res.json();
        if (!payload.success) throw new Error(payload.error);
        return payload.data;
    } catch (err) {
        console.error(`MongoDB query failed for ${tradeObject}:`, err);
        throw err;
    }
}

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
