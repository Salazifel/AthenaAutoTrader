import yahooFinance from 'yahoo-finance2';
import { IterationType } from '../trading_objects/TradeStrategy.js';
import fs from 'fs'; // Import the fs module for file operations

function getStockData(tradeObject, ticker, startDate, endDate) {
    // yahoo only allows data by the minute for the last 7 days
    // it also only allows hourly data for the last 60 days
    // and daily data for the last 30 years

    if (ticker === undefined || startDate === undefined || endDate === undefined) {
        throw new Error('Ticker, start date, and end date are required');
    }

    if (ticker == IterationType.PER_MINUTE) {
        if (new Date(endDate) - new Date(startDate) > 7 * 24 * 60 * 60 * 1000) {
            throw new Error('Yahoo Finance only allows minute data for the last 7 days');
        }
        ticker = '1m';
    };

    if (ticker == IterationType.PER_HOUR) {
        if (new Date(endDate) - new Date(startDate) > 60 * 24 * 60 * 60 * 1000) {
            throw new Error('Yahoo Finance only allows hourly data for the last 60 days');
        }
        ticker = '1h';
    };

    // default
    if (new Date(endDate) - new Date(startDate) > 30 * 365 * 24 * 60 * 60 * 1000) {
        throw new Error('Yahoo Finance only allows data for the last 30 years');
    }
    ticker = '1d';

    return yahooFinance.chart(tradeObject, {
        period1: startDate,
        period2: endDate,
        interval: ticker
    });    
}

export default getStockData;

// Usage example
const outputPath = './aapl_data.json';
async function fetchAndSave() {
    const data = await getStockData('AAPL', IterationType.PER_DAY, '2025-04-01', '2025-05-02');

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved data to ${outputPath}`);
}

fetchAndSave();