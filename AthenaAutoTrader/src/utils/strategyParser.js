export function parseStrategyToJson(strategyText) {
    const lines = strategyText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Extract analysis parameters
    const params = {};
    for (const line of lines) {
      if (line.startsWith('- Start Date:')) params.startDate = line.split(':')[1].trim().split(' ')[0];
      if (line.startsWith('- End Date:')) params.endDate = line.split(':')[1].trim().split(' ')[0];
      if (line.startsWith('- Initial Budget:')) params.initialBudget = parseFloat(line.split(':')[1].trim());
      if (line.startsWith('- Interest Rate:')) params.interestRate = parseFloat(line.split(':')[1].trim()) / 100;
      if (line.startsWith('- Cost Per Trade:')) params.costPerTrade = parseFloat(line.split(':')[1].trim());
    }
    
    // Extract strategy blocks
    const strategyLines = lines.filter(line => line.startsWith('IF') || line.startsWith('SELL') || line.startsWith('BUY') || line.startsWith('HOLD'));
    
    const tradeStrategies = [];
    let currentStrategy = null;
    
    for (const line of strategyLines) {
      if (line.startsWith('IF')) {
        const conditionMatch = line.match(/IF (\w+) (increases|decreases) (\d+)% in last (\d+) (days|weeks|months)/i);
        if (conditionMatch) {
          const [, stock, direction, percent, timeframe, timeunit] = conditionMatch;
          
          let timeframeInSeconds = parseInt(timeframe);
          if (timeunit === 'weeks') timeframeInSeconds *= 7 * 24 * 60 * 60;
          else if (timeunit === 'months') timeframeInSeconds *= 30 * 24 * 60 * 60;
          else timeframeInSeconds *= 24 * 60 * 60;
          
          currentStrategy = {
            tradeObjects: [{ shareName: stock }],
            iteration: "once",
            ifBlocks: [{
              objectToConsider: "price",
              comparisonSymbol: direction === 'increases' ? '>' : '<',
              value: parseFloat(percent),
              timeframe_in_seconds: timeframeInSeconds.toString()
            }],
            thenBlock: null
          };
        }
      } 
      else if (line.startsWith('SELL') || line.startsWith('BUY')) {
        const actionMatch = line.match(/(SELL|BUY) (\d+) shares of (\w+)/i);
        if (actionMatch && currentStrategy) {
          const [, action, amount, stock] = actionMatch;
          currentStrategy.thenBlock = {
            action: action.toLowerCase(),
            unitType: "shares",
            unitValue: parseInt(amount)
          };
          tradeStrategies.push(currentStrategy);
          currentStrategy = null;
        }
      }
      else if (line.startsWith('HOLD')) {
        const holdMatch = line.match(/HOLD (\w+) for (\d+) days/i);
        if (holdMatch && currentStrategy) {
          const [, stock, days] = holdMatch;
          currentStrategy.thenBlock = {
            action: "hold",
            unitType: "days",
            unitValue: parseInt(days)
          };
          tradeStrategies.push(currentStrategy);
          currentStrategy = null;
        }
      }
    }
    
    return {
      tradeStrategies,
      initialBudget: params.initialBudget,
      analyzer: {
        startDateTime: `${params.startDate}T00:00:00.000Z`,
        endDateTime: `${params.endDate}T00:00:00.000Z`,
        interestRate: params.interestRate,
        costPerTrade: params.costPerTrade,
        taxOnProfit: 0,
        outputLog: [],
        otherAnalyzers: [],
        roi: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0
      }
    };
  }