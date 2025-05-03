const ActionEnum = Object.freeze({
    BUY: "buy",
    SELL: "sell",
});

const UnitTypeEnum = Object.freeze({
    PERCENT: "%",
    UNIT: "shares",
    ABSOLUTE: "absolute",
});

class ThenBlock {
    constructor(action, unitType, unitValue) {
        /**
         * @param {string} action - The action to perform (e.g., ActionEnum.BUY or ActionEnum.SELL).
         * @param {string} unitType - The type of unit (e.g., UnitTypeEnum.PERCENT, UnitTypeEnum.UNIT, or UnitTypeEnum.ABSOLUTE).
         * @param {number} unitValue - The value of the unit.
         */
        if (!Object.values(ActionEnum).includes(action)) {
            throw new Error(`Invalid action: ${action}`);
        }
        if (!Object.values(UnitTypeEnum).includes(unitType)) {
            throw new Error(`Invalid unitType: ${unitType}`);
        }

        this.action = action;
        this.unitType = unitType;
        this.unitValue = unitValue;
    }

    async execute(tradeStrategyCollector, tradeObject, currentTime, currentPrice) {
        if (this.action === ActionEnum.BUY) {
            let purchaseFactor;

            switch (this.unitType) {
                case UnitTypeEnum.PERCENT:
                    purchaseFactor = (tradeStrategyCollector.getPortfolio().getCash() / 100) / currentPrice
                    break;
                case UnitTypeEnum.UNIT:
                    purchaseFactor = this.unitValue;
                    break;
                case UnitTypeEnum.ABSOLUTE:
                    purchaseFactor = this.unitValue / currentPrice;
                    break;
                default:
                    throw new Error(`Invalid unitType: ${this.unitType}`);
            }
            let purchasePrice = currentPrice * purchaseFactor;
            if (purchasePrice + tradeStrategyCollector.getAnalyzer().getCostPerTrade() > tradeStrategyCollector.getPortfolio().getCash()) {
                tradeStrategyCollector.getAnalyzer().appendToOutputLog(`Not enough budget to buy ${this.unitValue} units of ${tradeObject.getShareName()} at time: ${currentTime}. Current cash: ${tradeStrategyCollector.getPortfolio().getCash()}, required: ${purchasePrice}`);
            }
            await tradeStrategyCollector.getPortfolio().updatePortfolio(tradeStrategyCollector, currentTime, tradeObject.getShareName(), currentPrice, purchaseFactor, currentTime);
            tradeStrategyCollector.getPortfolio().updateCash(tradeStrategyCollector, currentTime, - tradeStrategyCollector.getAnalyzer().getCostPerTrade());
            tradeStrategyCollector.getAnalyzer().appendToOutputLog(`Executing action: ${this.action} with unitType: ${this.unitType} and unitValue: ${this.unitValue} for tradeObject: ${tradeObject.getShareName()} at time: ${currentTime} at the price of ${currentPrice} with transaction cost of trade of ${tradeStrategyCollector.getAnalyzer().getCostPerTrade()}. Current cash: ${tradeStrategyCollector.getPortfolio().getCash()}`);
        }
        else {
            let sellFactor;
            if (tradeStrategyCollector.getPortfolio().getShareQuantity(tradeObject.getShareName()) === 0) {
                tradeStrategyCollector.getAnalyzer().appendToOutputLog(`No shares to sell for ${tradeObject.getShareName()} at time: ${currentTime}.`);
                return;
            }

            switch (this.unitType) {
                case UnitTypeEnum.PERCENT:
                    sellFactor = tradeStrategyCollector.getPortfolio().getShareQuantity(tradeObject.getShareName()) * this.unitValue / 100;
                    break;
                case UnitTypeEnum.UNIT:
                    sellFactor = this.unitValue;
                    break;
                case UnitTypeEnum.ABSOLUTE:
                    sellFactor = this.unitValue / currentPrice;
                    break;
                default:
                    throw new Error(`Invalid unitType: ${this.unitType}`);
            }

            await tradeStrategyCollector.getPortfolio().updatePortfolio(tradeStrategyCollector, currentTime, tradeObject.getShareName(), currentPrice, -sellFactor, currentTime);
            tradeStrategyCollector.getPortfolio().updateCash(tradeStrategyCollector, currentTime, - tradeStrategyCollector.getAnalyzer().getCostPerTrade());
            tradeStrategyCollector.getAnalyzer().appendToOutputLog(`Executing action: ${this.action} with unitType: ${this.unitType} and unitValue: ${this.unitValue} for tradeObject: ${tradeObject.getShareName()} at time: ${currentTime} at the price of ${currentPrice} with transaction cost of trade of ${tradeStrategyCollector.getAnalyzer().getCostPerTrade()}. Current cash: ${tradeStrategyCollector.getPortfolio().getCash()}`);	
        }
    }
}

export { ActionEnum, UnitTypeEnum };
export default ThenBlock;