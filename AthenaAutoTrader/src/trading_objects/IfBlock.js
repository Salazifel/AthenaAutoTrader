class IfBlock {
    constructor(objectToConsider, comparisonSymbol, value, timeframe_in_seconds) {
        this.objectToConsider = objectToConsider; // e.g., price or %
        this.comparisonSymbol = comparisonSymbol; // e.g., '>', '<', '=='
        this.value = value; // the value to compare against
        this.timeframe_in_seconds = timeframe_in_seconds; // timeframe for the condition
    }

    evaluate(currentMarketData) {
        const currentValue = currentMarketData[this.objectToConsider];
        switch (this.comparisonSymbol) {
            case '>':
                return currentValue > this.value;
            case '<':
                return currentValue < this.value;
            case '==':
                return currentValue === this.value;
            case '>=':
                return currentValue >= this.value;
            case '<=':
                return currentValue <= this.value;
            case '!=':
                return currentValue !== this.value;
            // Add more comparison cases as needed
            default:
                throw new Error('Invalid comparison symbol');
        }
    }

    checkCondition(historicalData, currentTime) {
        // historicalData = array of { date, open, high, low, close, adjclose }
        // currentTime = a date string or Date object

    
        // 1️⃣ Find the latest available price at or before currentTime
        const quotes = historicalData.quotes;
        for (const quote of quotes) {
            if (new Date(quote.date) <= currentTime) {
                currentPrice = quote.close;
                break;
            }
        }
        
        if (!currentPrice) {
            console.log('No stock available on that date');
            return;
        }
    
        // 2️⃣ If timeframe is 0, do a direct comparison
        if (!this.timeframe_in_seconds || this.timeframe_in_seconds === 0) {
            return this.evaluate({ [this.objectToConsider]: currentValue });
        }
    
        // 3️⃣ Otherwise, find the price at (currentTime - timeframe_in_seconds)
        const pastTime = new Date(now.getTime() - this.timeframe_in_seconds * 1000);
    
        const pastData = historicalData
            .slice()
            .reverse()
            .find(item => new Date(item.date) <= pastTime);
    
        if (!pastData) {
            throw new Error('No historical data available for the timeframe.');
        }
    
        const pastValue = pastData.close;
    
        let valueToCompare;
        if (this.objectToConsider === 'price') {
            valueToCompare = currentValue;
        } else if (this.objectToConsider === 'percent_change') {
            const percentChange = ((currentValue - pastValue) / pastValue) * 100;
            valueToCompare = percentChange;
        } else {
            throw new Error('Unsupported objectToConsider');
        }
    
        return this.evaluate({ [this.objectToConsider]: valueToCompare });
    }    
}

export default IfBlock;