import IfBlock from './trading_objects/IfBlock.js'
import ThenBlock from './trading_objects/ThenBlock.js';
import TradeObject from './trading_objects/TradeObject.js';
import TradeStrategy from './trading_objects/TradeStrategy.js';
import TradeStrategyCollector from './trading_objects/TradeStrategyCollector.js';
import Analyzer from './trading_objects/Analyzer.js';

// Test script
const testTradeStrategy = () => {
    const tradeStrategyCollector = new TradeStrategyCollector();
    // define the strategy collector
    const initialBudget = 10000; // Set initial budget for the trade strategy
    const analyzer = new Analyzer(new Date('2023-01-10'), new Date('2023-01-15'), 0.05, 0.02);
    
    // ########### let's create a buy strategy for a stock
    const buyingTradeStrategy = new TradeStrategy();
    const ifBlock = new IfBlock('percentage', '>', 0.01, '10000');
    const thenBlock = new ThenBlock('buy', '%', 10);
    const tradeObject = new TradeObject('AAPL');
    // Add the IfBlock, ThenBlock, and TradeObject to the strategy
    buyingTradeStrategy.addIfBlock(ifBlock);
    buyingTradeStrategy.setThenBlock(thenBlock);
    buyingTradeStrategy.addTradeObject(tradeObject);
    buyingTradeStrategy.setIteration('per_day');
    // Add the strategy to the collector
    tradeStrategyCollector.addTradeStrategy(buyingTradeStrategy);

    // set the definitions of the strategy collector
    tradeStrategyCollector.setAnalyzer(analyzer);
    tradeStrategyCollector.setInitialBudget(initialBudget);

    // ########### let's create a sell strategy for a stock
    const sellingTradeStrategy = new TradeStrategy();
    const ifBlockSell = new IfBlock('price', '<', 150, '0');
    const thenBlockSell = new ThenBlock('sell', '%', 5);
    const tradeObjectSell = new TradeObject('AAPL');
    // Add the IfBlock, ThenBlock, and TradeObject to the strategy
    sellingTradeStrategy.addIfBlock(ifBlockSell);
    sellingTradeStrategy.setThenBlock(thenBlockSell);
    sellingTradeStrategy.addTradeObject(tradeObjectSell);
    sellingTradeStrategy.setIteration('once');
    // Add the strategy to the collector
    tradeStrategyCollector.addTradeStrategy(sellingTradeStrategy);

    console.log(tradeStrategyCollector.createJSON());
    // save the json to a file
    const jsonString = tradeStrategyCollector.createJSON();
    /*fs.writeFileSync('tradeStrategy.json', jsonString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('File has been written successfully');
        }
    });*/

    // Execute the trade strategy
    tradeStrategyCollector.executeTradeStrategy();
    console.log('Finished');
};

// Run the test
testTradeStrategy();