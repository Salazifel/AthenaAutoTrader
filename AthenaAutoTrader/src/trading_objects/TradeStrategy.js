import TradeObject from './TradeObject.js';
import IfBlock from './IfBlock.js';
import ThenBlock from './ThenBlock.js';

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
        this.iteration = IterationType.ONCE; // Default value

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
            this.iteration = iteration;
        } else {
            throw new Error('Invalid IterationType');
        }
    }

    checkTradeStrategyValidity() {
        if (this.ifBlocks.length === 0) {
            throw new Error('At least one IfBlock is required');
        }

        if (!this.thenBlock) {
            throw new Error('ThenBlock is required');
        }

        if (this.tradeObjects.length === 0) {
            throw new Error('At least one TradeObject is required');
        }

        if (!this.analyzer) {
            throw new Error('Analyzer is required for analysis');
        }

        return true;
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
    getIteration() {
        return this.iteration;
    }
}

export { IterationType };
export default TradeStrategy;