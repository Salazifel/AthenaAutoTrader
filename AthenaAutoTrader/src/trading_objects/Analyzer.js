class Analyzer {
    constructor(startDateTime, endDateTime, interestRate, costPerTrade = 0, taxOnProfit = 0) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.interestRate = interestRate; // Interest rate for comparison
        this.costPerTrade = costPerTrade; // Cost per trade for the analysis
        this.taxOnProfit = taxOnProfit; // Tax on profit for the analysis
        
        this.outputLog = [];
        this.otherAnalyzers = [];
        
        // Metrics
        this.roi = 0; // Return on Investment
        this.annualizedReturn = 0; // Annualized Return
        this.sharpeRatio = 0; // Sharpe Ratio
        this.maxDrawdown = 0; // Max Drawdown
        this.winRate = 0; // Win Rate
        this.profitFactor = 0; // Profit Factor
    }

    setStartDateTime(startDateTime) {
        if (startDateTime instanceof Date) {
            this.startDateTime = startDateTime;
        } else {
            throw new Error('Invalid start date/time format');
        }
    }

    setEndDateTime(endDateTime) {
        if (endDateTime instanceof Date) {
            this.endDateTime = endDateTime;
        } else {
            throw new Error('Invalid end date/time format');
        }
    }

    addComparisonAnalyzer(analyzer) {
        if (analyzer instanceof Analyzer) {
            this.otherAnalyzers.push(analyzer);
        } else {
            throw new Error('Invalid Analyzer instance');
        }
    }

    removeComparisonAnalyzer(analyzer) {
        const index = this.otherAnalyzers.indexOf(analyzer);
        if (index > -1) {
            this.otherAnalyzers.splice(index, 1);
        } else {
            throw new Error('Analyzer not found in comparison analyzers');
        }
    }

    appendToOutputLog(message) {
        if (typeof message === 'string') {
            this.outputLog.push(message);
        } else {
            throw new Error('Invalid log message format');
        }
    }

    setInterestRate(interestRate) {
        if (typeof interestRate === 'number') {
            this.interestRate = interestRate;
        } else {
            throw new Error('Invalid interest rate format');
        }
    }

    setCostPerTrade(costPerTrade) {
        if (typeof costPerTrade === 'number') {
            this.costPerTrade = costPerTrade;
        } else {
            throw new Error('Invalid cost per trade format');
        }
    }

    setTaxOnProfit(taxOnProfit) {
        if (typeof taxOnProfit === 'number') {
            this.taxOnProfit = taxOnProfit;
        } else {
            throw new Error('Invalid tax on profit format');
        }
    }
}

export default Analyzer;