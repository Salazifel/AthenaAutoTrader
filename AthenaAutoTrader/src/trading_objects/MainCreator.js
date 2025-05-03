import TradeObject from './TradeObject.js'
import IfBlock from './IfBlock.js'
import ThenBlock from './ThenBlock.js'
import TradeStrategy from './TradeStrategy.js'
import Analyzer from './Analyzer.js'
import IterationType from './TradeStrategy.js'
import TradeStrategyCollector from './TradeStrategyCollector.js'

export function createTradeObject(shareName) {
    return new TradeObject(shareName)
}

export function createIteration(iterationType) {
    return new IterationType(iterationType)
}

export function createIfBlock(objectToConsider, comparisonSymbol, value, timeframe_in_seconds) {
    return new IfBlock(objectToConsider, comparisonSymbol, value, timeframe_in_seconds)
}

export function createThenBlock(action, unitType, unitValue) {
    return new ThenBlock(action, unitType, unitValue)
}

export function createTradeStrategy(tradeObjects, iteration, ifBlocks, thenBlock) {
    return new TradeStrategy(tradeObjects, iteration, ifBlocks, thenBlock)
}

export function createAnalyzer(startDateTime, endDateTime, interestRate, costPerTrade) {
    return new Analyzer(startDateTime, endDateTime, interestRate, costPerTrade)
}

export function createTradeStrategyCollector(tradeStrategies, initialBudget, analyzer) {
    return new TradeStrategyCollector(tradeStrategies, initialBudget, analyzer)
}