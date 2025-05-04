import TradeStrategy from './TradeStrategy.js';
import Analyzer from './Analyzer.js'; // Assuming you have an Analyzer class defined somewhere
import { getStockData } from '../stock_data_collector/stockAPI.js';
import Portfolio from '../trading_objects/Portfolio.js';
import { IterationType } from './TradeStrategy.js'; // Assuming you have an IterationType enum defined somewhere
import fs from 'fs'; // Import the fs module for file operations
import { getCurrentPrice } from '../stock_data_collector/stockAPI.js'; // Assuming you have a function to get the current price


class TradeStrategyCollector {
  constructor(tradeStrategies, initialBudget, analyzer) {
    this.tradeStrategies = tradeStrategies || [];
    this.analyzer = analyzer;
    this.initialBudget = initialBudget || 0; // Initial budget for the trade strategy
    this.portfolio = new Portfolio();
  }

  addTradeStrategy(tradeStrategy) {
    if (tradeStrategy instanceof TradeStrategy) {
      this.tradeStrategies.push(tradeStrategy);
    } else {
      throw new Error('Invalid TradeStrategy instance');
    }
  }

  getPortfolio() {
    return this.portfolio;
  }

  setAnalyzer(analyzer) {
    if (analyzer instanceof Analyzer) {
      this.analyzer = analyzer;
    } else {
      throw new Error('Invalid Analyzer instance');
    }
  }

  getAnalyzer() {
    return this.analyzer;
}

  setInitialBudget(initialBudget) {
    if (typeof initialBudget !== 'number') {
        throw new Error('Initial budget must be a number');
    }

    if (initialBudget < 0) {
        throw new Error('Initial budget cannot be negative');
    }

    const OneDayAgo = new Date(this.analyzer.getStartDateTime().getTime() - 24 * 60 * 60 * 1000);
    this.initialBudget = initialBudget;
    this.portfolio.updateCash(this, OneDayAgo, initialBudget);
}

    async executeTradeStrategy() {
        try {
            this.getAnalyzer().appendToOutputLog('Initial Budget: ' + this.initialBudget);
            
            for (const tradeStrategy of this.tradeStrategies) {
                if (!tradeStrategy.checkTradeStrategyValidity()) {
                    throw new Error('Trade strategy is not valid');
                }
            }

            // get historical data for the trade objects in the defined timeframe on the fine-grained level of the interval
            /*for (const tradeStrategy of this.tradeStrategies) {
                for (const tradeObject of tradeStrategy.tradeObjects) {
                    tradeObject.setHistoricalData(await getStockData(tradeObject.getShareName(), tradeStrategy.getIteration(), this.analyzer.getStartDateTime(), this.analyzer.getEndDateTime()));
                }
            }*/

            // in the timeframe defined in the analyzer and using the iteration type, make a loop
            let currentTime = this.analyzer.getStartDateTime();
            const endTime = this.analyzer.getEndDateTime();    
            for (const tradeStrategy of this.tradeStrategies) {
                currentTime = this.analyzer.getStartDateTime();
                let breakTradeStrategy = false;
                const interval = tradeStrategy.getIteration();
                while (true) {
                    if (breakTradeStrategy) {
                        break;
                    }

                    if (this.addIterationToDateTime(currentTime, interval) > endTime) {
                        break;
                    }

                    for (const tradeObject of tradeStrategy.tradeObjects) {
                        if (tradeStrategy.getIfBlocks().every(ifBlock => ifBlock.checkCondition(currentTime, tradeObject.getShareName()))) {
                            let currentPrice = await getCurrentPrice(currentTime, tradeObject.getShareName());
                            // If all conditions
                            // exectute the then block
                            await tradeStrategy.getThenBlock().execute(this, tradeObject, currentTime, currentPrice);
                            if (interval === IterationType.ONCE) {
                                breakTradeStrategy = true;
                                break;
                            }
                        }
                    }
                    currentTime = this.addIterationToDateTime(currentTime, interval);
                }
            }

            // console log the portfolio value logs
            console.log('Portfolio Value Logs: ', this.analyzer.getPortfolioLog());
            // console log the cash logs
            console.log('Cash Logs: ', this.analyzer.getCashLog());
            // console log the output logs
            console.log('Output Logs: ', this.analyzer.getOutputLog());

            // save the logs to a file
            /*fs.writeFile('tradeStrategyLogs.json', JSON.stringify(this.analyzer.getOutputLog(), null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file', err);
                }
                else {
                    console.log('Trade strategy logs saved to tradeStrategyLogs.json');
                }
            });

            // save the cashLogs in a json file
            fs.writeFile('tradeStrategyCashLogs.json', JSON.stringify(this.analyzer.getCashLog(), null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file', err);
                }
                else {
                    console.log('Trade strategy cash logs saved to tradeStrategyCashLogs.json');
                }
            });

            // save the portfolio value in a json file
            fs.writeFile('tradeStrategyPortfolioValue.json', JSON.stringify(this.analyzer.getPortfolioLog(), null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file', err);
                }
                else {
                    console.log('Trade strategy portfolio value logs saved to tradeStrategyPortfolioValue.json');
                }
            });*/

            const output = {
                outputLog: this.analyzer.getOutputLog(),
                cashLog: this.analyzer.getCashLog(),
                portfolioLog: this.analyzer.getPortfolioLog()
            };

            return output;

        } catch (error) {
            console.error('Error executing trade strategy:', error.message);
        }
    }

    addIterationToDateTime(dateTime, iteration) {
        switch (iteration) {
            case IterationType.ONCE:
                return new Date(dateTime.getTime() + 24 * 60 * 60 * 1000); // Move to the next day
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
        return JSON.stringify(this);
    }
}

export default TradeStrategyCollector;