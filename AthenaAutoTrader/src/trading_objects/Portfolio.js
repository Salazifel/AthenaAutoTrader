import { getCurrentPrice } from "../stock_data_collector/stockAPI.js";

class Portfolio {
    constructor() {
        this.tradingObjects = {};
        this.cash = 0;
    }

    async updatePortfolio(tradeStrategyCollector, timeStamp, shareName, paidPricePerShare, quantity, date) {
        if (this.tradingObjects[shareName]) {
            if (quantity < 0) {
                // if quantity is negative, check if we have enough shares to sell, if not, sell all we have
                if (this.tradingObjects[shareName].quantity + quantity < 0) {
                    quantity = -this.tradingObjects[shareName].quantity; // Sell all we have
                }

                // Calculate realized P/L
                const profit = (paidPricePerShare - this.tradingObjects[shareName].averagePricePerShare) * quantity;
                this.tradingObjects[shareName].profit += profit;
            }
            // Update existing trading object
            const tradingObject = this.tradingObjects[shareName];
            if (quantity > 0) {
                // Buying more shares → adjust average price
                tradingObject.averagePricePerShare = 
                    (tradingObject.averagePricePerShare * tradingObject.quantity + paidPricePerShare * quantity) /
                    (tradingObject.quantity + quantity);
            }
            tradingObject.quantity += quantity;
            tradingObject.lastUpdated = date;

            // update cash based on the transaction
            this.cash -= paidPricePerShare * quantity;

            if (tradingObject.quantity <= 0) {
                // Remove trading object if quantity is 0 or less
                delete this.tradingObjects[shareName];
            }
            
            let totalPortfolioValue = 0;
            for (const shareName in this.tradingObjects) {
                if (this.tradingObjects.hasOwnProperty(shareName)) {
                    totalPortfolioValue += this.tradingObjects[shareName].quantity * await getCurrentPrice(timeStamp, shareName);
                }
            }

            tradeStrategyCollector.getAnalyzer().appendPortfolioLog(totalPortfolioValue, timeStamp);
            tradeStrategyCollector.getAnalyzer().appendToOutputLog('Current portfolio value: ' + totalPortfolioValue + ' at time: ' + timeStamp);
        } else {
            // Create new trading object
            this.tradingObjects[shareName] = {
                quantity: quantity,
                averagePricePerShare: paidPricePerShare,
                lastUpdated: date
            };

            // update cash based on the transaction
            this.cash -= paidPricePerShare * quantity;
        }
    }

    getShareQuantity(shareName) {
        return this.tradingObjects[shareName] ? this.tradingObjects[shareName].quantity : 0;
    }

    getShareAveragePrice(shareName) {
        return this.tradingObjects[shareName] ? this.tradingObjects[shareName].averagePricePerShare : 0;
    }

    updateCash(tradeStrategyCollector, timeStamp, cash) {
        tradeStrategyCollector.getAnalyzer().appendCashLog(this.cash + cash, timeStamp);
        tradeStrategyCollector.getAnalyzer().appendToOutputLog('Current cash: ' + this.cash + ' at time: ' + timeStamp);
        this.cash += cash;
    }

    getCash() {
        return this.cash;
    }

    setCash(cash) {
        this.cash = cash;
    }
}

export default Portfolio;