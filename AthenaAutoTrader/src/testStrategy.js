import IfBlock from '../trading_objects/IfBlock';
import ThenBlock from '../trading_objects/ThenBlock';
import TradeObject from '../trading_objects/TradeObject';
import TradeStrategy from '../trading_objects/TradeStrategy';

// Test script
const testTradeStrategy = () => {
    // Create instances of IfBlock, ThenBlock, and TradeObject
    const ifBlock = new IfBlock('price', '>', 100, '1m', 0.5);
    const thenBlock = new ThenBlock('buy', '%', 10);
    const tradeObject = new TradeObject('AAPL');

    // Create an instance of TradeStrategy
    const tradeStrategy = new TradeStrategy();

    // Add the IfBlock, ThenBlock, and TradeObject to the strategy
    tradeStrategy.addIfBlock(ifBlock);
    tradeStrategy.setThenBlock(thenBlock);
    tradeStrategy.addTradeObject(tradeObject);

    // Set the iteration type
    tradeStrategy.setIteration('once');

    // Log the strategy details
    console.log('Trade Strategy:', tradeStrategy);
    console.log('If Blocks:', tradeStrategy.getIfBlocks());
};

// Run the test
testTradeStrategy();