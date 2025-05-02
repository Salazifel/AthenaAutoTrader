class TradeObject {
    constructor(shareName) {
        if (!shareName || typeof shareName !== 'string') {
            throw new Error('A valid share name must be provided.');
        }
        this.shareName = shareName;
    }

    getShareName() {
        return this.shareName;
    }

    setShareName(newShareName) {
        if (!newShareName || typeof newShareName !== 'string') {
            throw new Error('A valid share name must be provided.');
        }
        this.shareName = newShareName;
    }
}

export default TradeObject;