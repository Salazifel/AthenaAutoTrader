import TradeStrategy from './TradeStrategy.js';
import Analyzer from './Analyzer.js'; // Assuming you have an Analyzer class defined somewhere

class TradeStrategyCollector {
  constructor() {
    this.tradeStrategies = []; // Array to hold trade strategies
    this.analyzer = null; // Placeholder for an analyzer object
    this.initialBudget = 0;
  }

  addTradeStrategy(tradeStrategy) {
    if (tradeStrategy instanceof TradeStrategy) {
      this.tradeStrategies.push(tradeStrategy);
    } else {
      throw new Error('Invalid TradeStrategy instance');
    }
  }

  setAnalyzer(analyzer) {
    if (analyzer instanceof Analyzer) {
      this.analyzer = analyzer;
    } else {
      throw new Error('Invalid Analyzer instance');
    }
  }

  setInitialBudget(initialBudget) {
    if (typeof initialBudget !== 'number') {
        throw new Error('Initial budget must be a number');
    }

    if (initialBudget < 0) {
        throw new Error('Initial budget cannot be negative');
    }
    this.initialBudget = initialBudget;
}

    async executeTradeStrategy() {
        try {
            for (const tradeStrategy of this.tradeStrategies) {
                if (!tradeStrategy.checkTradeStrategyValidity()) {
                    throw new Error('Trade strategy is not valid');
                }
            }

            // in the timeframe defined in the analyzer and using the iteration type, make a loop
            const currentTime = this.analyzer.getStartDateTime();
            const endTime = this.analyzer.getEndDateTime();
            const interval = this.getIteration();
            while (true) {
                if (this.addIterationToDateTime(currentTime, interval) > endTime) {
                    break;
                }

                for (const tradeObject of this.tradeObjects) {
                    // continue
                }
            }
                


        } catch (error) {
            console.error('Error executing trade strategy:', error.message);
        }
    }

    addIterationToDateTime(dateTime, iteration) {
        switch (iteration) {
            case IterationType.ONCE:
                return dateTime;
            case IterationType.ALWAYS:
                return dateTime;
            case IterationType.PER_MINUTE:
                return new Date(dateTime.getTime() + 60 * 1000);
            case IterationType.PER_HOUR:
                return new Date(dateTime.getTime() + 60 * 60 * 1000);
            case IterationType.PER_DAY:
                return new Date(dateTime.getTime() + 24 * 60 * 60 * 1000);
            case IterationType.PER_WEEK:
                return new Date(dateTime.getTime() + 7 * 24 * 60 * 60 * 1000);
            default:
                throw new Error('Invalid iteration type');
        }
    }

    createJSON() {
        return JSON.stringify({
            tradeStrategies: this.tradeStrategies.map(strategy => strategy.toJSON ? strategy.toJSON() : strategy),
            analyzer: this.analyzer ? (this.analyzer.toJSON ? this.analyzer.toJSON() : this.analyzer) : null,
            initialBudget: this.initialBudget
        }, null, 2);
    }
}

export default TradeStrategyCollector;