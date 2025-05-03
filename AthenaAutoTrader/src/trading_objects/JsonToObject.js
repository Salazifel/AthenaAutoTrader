import TradeStrategyCollector from './TradeStrategyCollector.js';
import TradeStrategy from './TradeStrategy.js';
import Analyzer from './Analyzer.js';
import TradeObject from './TradeObject.js';
import IfBlock from './IfBlock.js';
import ThenBlock from './ThenBlock.js';
import fs from 'fs'; // Import the fs module for file operations

export function parseJSONToTradeStrategyCollector(jsonString) {
    const data = JSON.parse(jsonString);
    const tradeStrategies = data.tradeStrategies.map(strategyData => {
        const tradeStrategy = new TradeStrategy();
        tradeStrategy.setIteration(strategyData.iteration);
        tradeStrategy.addTradeObject(new TradeObject(strategyData.tradeObject.shareName));
        tradeStrategy.setThenBlock(new ThenBlock(strategyData.thenBlock.action, strategyData.thenBlock.unitType, strategyData.thenBlock.unitValue));
        strategyData.ifBlocks.forEach(ifBlockData => {
            const ifBlock = new IfBlock(ifBlockData.objectToConsider, ifBlockData.comparisonSymbol, ifBlockData.value, ifBlockData.timeframe_in_seconds);
            tradeStrategy.addIfBlock(ifBlock);
        });
        return tradeStrategy;
    });
    const initialBudget = data.initialBudget || 0;  
    const analyzer = new Analyzer(new Date(data.analyzer.startDateTime), new Date(data.analyzer.endDateTime), data.analyzer.interestRate, data.analyzer.costPerTrade);
    const tradeStrategyCollector = new TradeStrategyCollector(tradeStrategies, initialBudget, analyzer);

    return tradeStrategyCollector;

}

const jsonString = fs.readFileSync('tradeStrategy.json', 'utf8');
parseJSONToTradeStrategyCollector(jsonString);