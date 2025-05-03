class IfBlock {
    constructor(objectToConsider, comparisonSymbol, value, timeframe_in_seconds) {
        this.objectToConsider = objectToConsider; // e.g., price or RSI
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
}

export default IfBlock;