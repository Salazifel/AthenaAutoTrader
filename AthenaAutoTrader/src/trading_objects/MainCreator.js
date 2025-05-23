import TradeObject from './TradeObject.js'
import IfBlock from './IfBlock.js'
import ThenBlock from './ThenBlock.js'
import TradeStrategy from './TradeStrategy.js'
import Analyzer from './Analyzer.js'
import IterationType from './TradeStrategy.js'
import TradeStrategyCollector from './TradeStrategyCollector.js'
import { parseJSONToTradeStrategyCollector } from './JsonToObject.js'

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

export function runAutoTraderFromJSON(jsonSting) {
    try {
        const tradeStrategyCollector = parseJSONToTradeStrategyCollector(jsonSting)
        return tradeStrategyCollector.executeTradeStrategy()
    }
    catch (error) {
        console.error('Error executing trade strategy:', error)
        return null
    }
}

import fs from 'fs' // Import the fs module for file operations
// Example usage
//const jsonSting = fs.readFileSync('tradeStrategy.json', 'utf8')
//runAutoTraderFromJSON(jsonSting)