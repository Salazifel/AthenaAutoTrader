export function createTradeStrategyCollector(tradeStrategies, initialBudget, analyzer) {
    return {
        tradeStrategies: tradeStrategies,
        initialBudget: initialBudget,
        analyzer: analyzer,
        createJSON: function() {
            return JSON.stringify({
                tradeStrategies: this.tradeStrategies.map(strategy => strategy.toJSON ? strategy.toJSON() : strategy),
                analyzer: this.analyzer ? (this.analyzer.toJSON ? this.analyzer.toJSON() : this.analyzer) : null,
                initialBudget: this.initialBudget
            }, null, 2);
        }
    };
}