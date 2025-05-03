// Function to get a stock entry by name and type
function getStockEntry(stockName, stockType) {
    try {
        const stockDatabase = createDatabase();

        const stockEntry = stockDatabase.find(
            stock => stock.name === stockName && stock.type === stockType
        );

        if (stockEntry) {
            return stockEntry;
        } else {
            console.log(`Stock with name "${stockName}" and type "${stockType}" not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error reading or parsing the database:', error);
        return null;
    }
}

function getTrendingETFs() {
    // to be later replaced with a web scraping function
    try {
        // Example list of popular ETFs (customize as needed)
        const etfs = [
            'SPY', 'QQQ', 'VTI', 'DIA', 'ARKK',
            'IVV', 'VOO', 'IWM', 'EFA', 'EEM',
            'XLK', 'XLF', 'XLV', 'XLE', 'XLU',
            'VNQ', 'HYG', 'LQD', 'BND', 'TLT'
        ];        
        
        return etfs;
    } catch (err) {
        console.error('Error fetching trending ETFs:', err.message);
        return ['SPY', 'QQQ'];
    }
}


function getTrendingStocks() {
    // to be later replaced with a web scraping function
    try {
        // Expanded list of trending stocks from the S&P 500 (customize as needed)
        const sp500Tickers = [
            // Mega tech
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B',
        
            // Financials
            'JPM', 'BAC', 'WFC', 'GS', 'MS', 'AXP', 'BLK',
        
            // Healthcare
            'UNH', 'JNJ', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'LLY',
        
            // Consumer defensive
            'PG', 'KO', 'PEP', 'COST', 'WMT', 'MDLZ', 'CL',
        
            // Consumer discretionary
            'HD', 'LOW', 'MCD', 'SBUX', 'NKE', 'DIS', 'TJX',
        
            // Energy
            'XOM', 'CVX', 'COP', 'SLB', 'EOG',
        
            // Industrials
            'BA', 'CAT', 'DE', 'LMT', 'UNP', 'HON', 'GE', 'RTX',
        
            // Tech hardware & software
            'INTC', 'AMD', 'AVGO', 'CSCO', 'ADBE', 'CRM', 'ORCL', 'IBM',
        
            // Telecom
            'VZ', 'T', 'TMUS',
        
            // Utilities
            'NEE', 'DUK', 'SO',
        
            // Real estate
            'PLD', 'AMT', 'CCI',
        
            // Payment processors
            'V', 'MA', 'PYPL',
        
            // Others / misc
            'CMCSA', 'NFLX', 'ACN', 'TXN', 'QCOM', 'LIN', 'SPGI', 'NOW'
        ];
        
        return sp500Tickers;
    } catch (err) {
        console.error('Error fetching trending stocks:', err.message);
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    }
}

function createDatabase() {
    const database = [];

    // 1️⃣ Fetch trending stocks from Yahoo Finance
    const stocks = getTrendingStocks();
    stocks.forEach(stock => database.push({ name: stock, type: 'stock' }));

    // 2️⃣ Add popular ETFs manually or scrape
    const etfs = getTrendingETFs();
    etfs.forEach(etf => database.push({ name: etf, type: 'etf' }));

    // Write to JSON file
    return database;
}



export { getStockEntry, createDatabase, getTrendingStocks, getTrendingETFs };