import yahooFinance from 'yahoo-finance2';
import { IterationType } from '../trading_objects/TradeStrategy.js';
import fs from 'fs'; // Import the fs module for file operations

function getStockData(tradeObject, startDate, endDate) {
    // get the actual current date and time
    const currentDate = new Date();
    const OneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    if (startDate < (currentDate - OneDayAgo * 1990)) {
        throw new Error('Start date must be at least 1990 days before the current date');
    }

    if (startDate === undefined || endDate === undefined) {
        throw new Error('Start date, and end date are required');
    }

    return yahooFinance.chart(tradeObject, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
    });    
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

    return currentPrice.close; // Assuming you want the closing price
}

export { getCurrentPrice };
