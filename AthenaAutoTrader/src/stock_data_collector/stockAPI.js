// import yahooFinance from 'yahoo-finance2';
// import { IterationType } from '../trading_objects/TradeStrategy.js';
// import fs from 'fs'; // Import the fs module for file operations


async function getStockData(tradeObject, startDate, endDate) {
    if (!tradeObject || !startDate || !endDate) {
        throw new Error('tradeObject, startDate, and endDate are required');
    }

    try {
        // Convert dates to ISO strings and ensure they're valid
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();
        
        const url = `http://localhost:3000/api/stock?symbol=${encodeURIComponent(tradeObject)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors' // Ensure CORS mode is set
        });
        
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        
        const payload = await res.json();
        
        if (!payload || !payload.success) {
            throw new Error(payload?.error || 'Invalid response format');
        }
        
        return payload.data;
    } catch (err) {
        console.error(`Failed to get stock data for ${tradeObject}:`, err);
        throw err;
    }
}



async function getCurrentPrice(currentTime, shareName) {
    if (!currentTime || !shareName) {
        throw new Error('currentTime and shareName are required');
    }

    try {
        // Ensure currentTime is a Date object
        const time = new Date(currentTime);
        if (isNaN(time.getTime())) {
            throw new Error('Invalid currentTime');
        }

        // Set to market open time (adjust timezone if needed)
        const marketTime = new Date(time);
        marketTime.setHours(13, 30, 0, 0); // Set to 1:30 PM

        const FiveDaysAgo = new Date(marketTime.getTime() - 5 * 24 * 60 * 60 * 1000);
        const FiveDaysAhead = new Date(marketTime.getTime() + 5 * 24 * 60 * 60 * 1000);

        const stockData = await getStockData(shareName, FiveDaysAgo, FiveDaysAhead);
        
        if (!stockData || !stockData.length) {
            throw new Error('No stock data available');
        }

        // Find the exact match or closest available price
        let currentPrice = 0;
        let closestDiff = Infinity;
        let closestPrice = 0;

        for (const quote of stockData) {
            const quoteDate = new Date(quote.Date);
            const diff = Math.abs(quoteDate.getTime() - marketTime.getTime());
            
            if (diff === 0) {
                currentPrice = quote.Close;
                break;
            }
            
            if (diff < closestDiff) {
                closestDiff = diff;
                closestPrice = quote.Close;
            }
        }

        if (!currentPrice) {
            console.log('No exact match found. Using closest available price.');
            currentPrice = closestPrice || stockData[Math.floor(stockData.length / 2)].Close;
        }

        return currentPrice;
    } catch (err) {
        console.error(`Failed to get current price for ${shareName}:`, err);
        throw err;
    }
}

export { getStockData, getCurrentPrice };

// Add a default export object that contains both functions
export default {
    getStockData,
    getCurrentPrice
};