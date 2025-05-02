const ActionEnum = Object.freeze({
    BUY: "buy",
    SELL: "sell",
});

const UnitTypeEnum = Object.freeze({
    PERCENT: "%",
    UNIT: "unit",
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
}

export { ActionEnum, UnitTypeEnum };
export default ThenBlock;