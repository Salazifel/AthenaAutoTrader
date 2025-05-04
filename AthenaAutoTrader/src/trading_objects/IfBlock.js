import { getCurrentPrice } from '../stock_data_collector/stockAPI.js';

class IfBlock {
    constructor(objectToConsider, comparisonSymbol, value, timeframe_in_seconds) {
        this.objectToConsider = objectToConsider; // e.g., price or percentage
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

    async checkCondition(currentTime, shareName) {
        // currentTime = a date string or Date object

    
        const currentPrice = await getCurrentPrice(currentTime, shareName);
    
        // If timeframe is 0, do a direct comparison
        if (this.timeframe_in_seconds === "0") {
            let valueToCompare;
            if (this.objectToConsider === 'price') {
            valueToCompare = currentPrice;
            } else {
            throw new Error('Unsupported objectToConsider for timeframe 0');
            }
            return this.evaluate({ [this.objectToConsider]: valueToCompare });
        }
    
        // Otherwise, find the price at (currentTime - timeframe_in_seconds)
        const startTimeToCheck = new Date(currentTime.getTime() - this.timeframe_in_seconds * 1000);
        const startPrice = await getCurrentPrice(startTimeToCheck, shareName);
        const endPrice = await getCurrentPrice(currentTime, shareName);

        // calculate the percentage change
        const valueToCompare = ((endPrice - startPrice) / startPrice) * 100; // percentage change

    
        return this.evaluate({ [this.objectToConsider]: valueToCompare });
    }    
}

export default IfBlock;