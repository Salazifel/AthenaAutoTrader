import TradeStrategyCollector from './TradeStrategyCollector.js';
import TradeStrategy from './TradeStrategy.js';
import Analyzer from './Analyzer.js';
import fs from 'fs'; // Import the fs module for file operations

export function parseJSONToTradeStrategyCollector(jsonString) {
    const data = JSON.parse(jsonString);


    // Reconstruct trade strategies
    if (Array.isArray(data.tradeStrategies)) {
        data.tradeStrategies.forEach(strategyData => {
            const tradeStrategy = Object.assign(new TradeStrategy(), strategyData);
            tradeStrategyCollector.addTradeStrategy(tradeStrategy);
        });
    }

    // Reconstruct analyzer
    if (data.analyzer) {
        const analyzer = Object.assign(new Analyzer(), data.analyzer);
        tradeStrategyCollector.setAnalyzer(analyzer);
    }

    // Set initial budget
    if (typeof data.initialBudget === 'number') {
        tradeStrategyCollector.setInitialBudget(data.initialBudget);
    }

    return tradeStrategyCollector;
}

const jsonString = fs.readFileSync('tradeStrategy.json', 'utf8');
parseJSONToTradeStrategyCollector(jsonString);