const IterationType = Object.freeze({
    ONCE: 'once',
    ALWAYS: 'always',
    PER_MINUTE: 'per_minute',
    PER_HOUR: 'per_hour',
    PER_DAY: 'per_day',
    PER_WEEK: 'per_week',
});

class TradeStrategy {
    constructor() {
        this.tradeObjects = [];
        this.iterations = IterationType.ONCE; // Default value

        this.ifBlocks = [];
        this.thenBlock;
    }

    addIfBlock(ifBlock) {
        if (ifBlock instanceof IfBlock) {
            this.ifBlocks.push(ifBlock);
        } else {
            throw new Error('Invalid IfBlock instance');
        }
    }

    setThenBlock(thenBlock) {
        if (thenBlock instanceof ThenBlock) {
            this.thenBlock = thenBlock;
        } else {
            throw new Error('Invalid ThenBlock instance');
        }
    }

    addTradeObject(tradeObject) {
        if (tradeObject instanceof TradeObject) {
            this.tradeObjects.push(tradeObject);
        } else {
            throw new Error('Invalid TradeObject instance');
        }
    }

    setIteration(iteration) {
        if (Object.values(IterationType).includes(iteration)) {
            this.iterations = iteration;
        } else {
            throw new Error('Invalid IterationType');
        }
    }

    // Getters for accessing private properties
    getTradeObjects() {
        return this.tradeObjects;
    }

    getIfBlocks() {
        return this.ifBlocks;
    }
    getThenBlock() {
        return this.thenBlock;
    }
    getIterations() {
        return this.iterations;
    }
}

export { IterationType };
export default TradeStrategy;