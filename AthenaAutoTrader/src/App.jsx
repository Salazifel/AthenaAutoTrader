import React, { useState } from "react";
import BlocklyWorkspace from "./BlocklyWorkspace";
import AnalysisModal from "./AnalysisModal";
import AssetChart from './AssetChart';
import revolutLogo from './assets/revolut-logo.png';
import { generateAIResponse } from "./geminiApi";

import {
  createTradeObject,
  createIfBlock,
  createThenBlock,
  createTradeStrategy,
  createAnalyzer,
  createTradeStrategyCollector
} from './trading_objects/MainCreator';

export default function App() {
  const [aiOutput, setAiOutput] = useState("Waiting for Analyze block...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisStrategy, setAnalysisStrategy] = useState("");

  const handleClick = async () => {
    const tradingBotJson = "{\n \"tradeStrategies\": [\n {\n \"tradeObjects\": [\n {\n \"shareName\": \"AAPL\"\n }\n ],\n \"iteration\": \"once\",\n \"ifBlocks\": [\n {\n \"objectToConsider\": \"price\",\n \"comparisonSymbol\": \">\",\n \"value\": 100,\n \"timeframe_in_seconds\": \"0\"\n }\n ],\n \"thenBlock\": {\n \"action\": \"buy\",\n \"unitType\": \"%\",\n \"unitValue\": 10\n }\n },\n {\n \"tradeObjects\": [\n {\n \"shareName\": \"AAPL\"\n }\n ],\n \"iteration\": \"once\",\n \"ifBlocks\": [\n {\n \"objectToConsider\": \"price\",\n \"comparisonSymbol\": \"<\",\n \"value\": 150,\n \"timeframe_in_seconds\": \"0\"\n }\n ],\n \"thenBlock\": {\n \"action\": \"sell\",\n \"unitType\": \"%\",\n \"unitValue\": 5\n }\n }\n ],\n \"analyzer\": {\n \"startDateTime\": \"2023-01-01T00:00:00.000Z\",\n \"endDateTime\": \"2023-12-31T00:00:00.000Z\",\n \"interestRate\": 0.05,\n \"costPerTrade\": 0.02,\n \"taxOnProfit\": 0,\n \"outputLog\": [],\n \"otherAnalyzers\": [],\n \"roi\": 0,\n \"annualizedReturn\": 0,\n \"sharpeRatio\": 0,\n \"maxDrawdown\": 0,\n \"winRate\": 0,\n \"profitFactor\": 0\n },\n \"initialBudget\": 10000\n}";
    const userCreatedTradingBot = `
      {\n  \"tradeStrategies\": [\n    {\n      \"tradeObjects\": [\n        {\n          \"shareName\": \"AAPL\"\n        }\n      ],\n      \"iteration\": \"once\",\n      \"ifBlocks\": [\n        {\n          \"objectToConsider\": \"price\",\n          \"comparisonSymbol\": \">\",\n          \"value\": 100,\n          \"timeframe_in_seconds\": \"0\"\n        }\n      ],\n      \"thenBlock\": {\n        \"action\": \"buy\",\n        \"unitType\": \"%\",\n        \"unitValue\": 10\n      }\n    },\n    {\n      \"tradeObjects\": [\n        {\n          \"shareName\": \"AAPL\"\n        }\n      ],\n      \"iteration\": \"once\",\n      \"ifBlocks\": [\n        {\n          \"objectToConsider\": \"price\",\n          \"comparisonSymbol\": \"<\",\n          \"value\": 150,\n          \"timeframe_in_seconds\": \"0\"\n        }\n      ],\n      \"thenBlock\": {\n        \"action\": \"sell\",\n        \"unitType\": \"%\",\n        \"unitValue\": 5\n      }\n    }\n  ],\n  \"analyzer\": {\n    \"startDateTime\": \"2023-01-01T00:00:00.000Z\",\n    \"endDateTime\": \"2023-12-31T00:00:00.000Z\",\n    \"interestRate\": 0.05,\n    \"costPerTrade\": 0.02,\n    \"taxOnProfit\": 0,\n    \"outputLog\": [],\n    \"otherAnalyzers\": [],\n    \"roi\": 0,\n    \"annualizedReturn\": 0,\n    \"sharpeRatio\": 0,\n    \"maxDrawdown\": 0,\n    \"winRate\": 0,\n    \"profitFactor\": 0\n  },\n  \"initialBudget\": 10000\n}
      [
        {
          "cash": 9899.98,
          "timestamp": "2023-01-01T00:00:00.000Z"
        },
        {
          "cash": 9800.9602,
          "timestamp": "2023-01-02T00:00:00.000Z"
        },
        {
          "cash": 9702.930597999999,
          "timestamp": "2023-01-03T00:00:00.000Z"
        },
        {
          "cash": 9605.881292019998,
          "timestamp": "2023-01-04T00:00:00.000Z"
        }
      ]
      [
      "Initial Budget: 10000",
      "Current cash: 9900 at time: Sun Jan 01 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Executing action: buy with unitType: % and unitValue: 10 for tradeObject: AAPL at time: Sun Jan 01 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit) at the price of 129.92999267578125 with transaction cost of trade of 0.02. Current cash: 9899.98",
      "Current portfolio value: 195.25932955059088 at time: Mon Jan 02 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Current cash: 9800.9802 at time: Mon Jan 02 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Executing action: buy with unitType: % and unitValue: 10 for tradeObject: AAPL at time: Mon Jan 02 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit) at the price of 125.06999969482422 with transaction cost of trade of 0.02. Current cash: 9800.9602",
      "Current portfolio value: 293.2689315505909 at time: Tue Jan 03 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Current cash: 9702.950598 at time: Tue Jan 03 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Executing action: buy with unitType: % and unitValue: 10 for tradeObject: AAPL at time: Tue Jan 03 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit) at the price of 125.06999969482422 with transaction cost of trade of 0.02. Current cash: 9702.930597999999",
      "Current portfolio value: 393.3230811471184 at time: Wed Jan 04 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Current cash: 9605.901292019998 at time: Wed Jan 04 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      "Executing action: buy with unitType: % and unitValue: 10 for tradeObject: AAPL at time: Wed Jan 04 2023 01:00:00 GMT+0100 (Mitteleuropäische Normalzeit) at the price of 126.36000061035156 with transaction cost of trade of 0.02. Current cash: 9605.881292019998"
      ]  
      [
        {
          "totalValue": 195.25932955059088,
          "timestamp": "2023-01-02T00:00:00.000Z"
        },
        {
          "totalValue": 293.2689315505909,
          "timestamp": "2023-01-03T00:00:00.000Z"
        },
        {
          "totalValue": 393.3230811471184,
          "timestamp": "2023-01-04T00:00:00.000Z"
        }
      ]
      `;

    setAiOutput(
      "Running analysis... Please wait."
    );
    const humanReadableResponse = await generateAIResponse(`
      You are a financial analyst. Your task is to analyze a trading strategy represented in JSON format. The JSON contains a list of trade strategies, each with its own conditions and actions. You need to evaluate the efficiency, profitability, and risk control of these strategies based on the provided parameters.
      You will be provided context about how it has performed in the past, including profits, cash balance and ROI. You should analyze it and provide some short suggestions (100 words absolute max) for the user to take as feedback. Do not use markdown format, it turns out ugly in the UI. The data you should analyze is as follows:
      JSON input:  ${userCreatedTradingBot}.
      `, false, "gemini-2.0-flash");

    setAiOutput(humanReadableResponse);

    const aiResponse = await generateAIResponse(`
      You are a machine that modifies trading strategy configurations represented in strict JSON format. You must improve the trading logic based on efficiency, profitability, and risk control, especially by:
      Adjusting buy/sell thresholds, actions, and unit values.
      Optionally adding a stop-loss strategy (e.g. sell if price drops too far after buying).
      Optionally using timeframe_in_seconds to simulate conditions like "if X doesn't happen within Y seconds".
      Your rules:
      Output only valid raw JSON. No markdown, no comments, no prose.
      Maintain the exact schema: do not rename keys or introduce new ones.
      You may duplicate or remove entries in tradeStrategies, but every one must follow the same structure.
      You may modify comparisonSymbol, value, action, unitType, unitValue, and timeframe_in_seconds.
      Do not explain your changes.
      Do not include any text, commentary, or non-JSON output.
      You may not alter keys inside analyzer, only the values (e.g. simulate ROI change).
      JSON input:  ${tradingBotJson}.
      Return only the improved JSON. Stop-losses should be implemented using the same logic structure (e.g. a new tradeStrategy that sells a portion of holdings if the price falls below a certain threshold after a buy). Time-based logic can be handled by modifying or setting timeframe_in_seconds. `
    , true);
    
      if (typeof aiResponse === "string") {
        setAiOutput("No response from Gemini");
      } else {
        setAiOutput(JSON.stringify(aiResponse, null, 2));
        setAnalysisStrategy(JSON.stringify(aiResponse, null, 2));
        setIsModalOpen(true);
      }
    };

    const handleAnalyzeTriggered = (strategy) => {
      try {
        const strategyJson = typeof strategy === 'string' ? JSON.parse(strategy) : strategy;
        if (strategyJson.analyzer.startDateTime) {
          strategyJson.analyzer.startDateTime = new Date(strategyJson.analyzer.startDateTime);
          if (isNaN(strategyJson.analyzer.startDateTime.getTime())) {
            throw new Error("Invalid start date");
          }
        }
        
        if (strategyJson.analyzer.endDateTime) {
          strategyJson.analyzer.endDateTime = new Date(strategyJson.analyzer.endDateTime);
          if (isNaN(strategyJson.analyzer.endDateTime.getTime())) {
            throw new Error("Invalid end date");
          }
        }
    
        // Ensure end date is after start date
        if (strategyJson.analyzer.endDateTime <= strategyJson.analyzer.startDateTime) {
          throw new Error("End date must be after start date");
        }
        const tradeStrategies = strategyJson.tradeStrategies.map(strat => {
          const tradeObjects = strat.tradeObjects.map(obj => 
            createTradeObject(obj.shareName)
          );
          
          const iteration = 'per_day';
          
          const ifBlocks = strat.ifBlocks.map(block => 
            createIfBlock(
              block.objectToConsider,
              block.comparisonSymbol,
              block.value,
              block.timeframe_in_seconds
            )
          );
          
          const thenBlock = createThenBlock(
            strat.thenBlock.action,
            strat.thenBlock.unitType,
            strat.thenBlock.unitValue
          );
          
          return createTradeStrategy(tradeObjects, iteration, ifBlocks, thenBlock);
        });
        
        const analyzer = createAnalyzer(
          strategyJson.analyzer.startDateTime,
          strategyJson.analyzer.endDateTime,
          strategyJson.analyzer.interestRate,
          strategyJson.analyzer.costPerTrade
        );
        
        const collector = createTradeStrategyCollector(
          tradeStrategies,
          strategyJson.initialBudget,
          analyzer
        );

        const result = collector.executeTradeStrategy();
        
        console.log("Created strategy collector:", collector);
        
        setAiOutput(JSON.stringify(strategyJson, null, 2));
        setAnalysisStrategy(JSON.stringify(strategyJson, null, 2));
        
      } catch (error) {
        console.error("Error processing strategy:", error);
        setAiOutput("Error processing strategy: " + error.message);
      }
    };
  

  const openAnalysisModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ backgroundColor: "#0C0C0E", minHeight: "100vh", color: "#fff", fontFamily: "SF Pro Display, sans-serif", position: "relative" }}>
      {/* Header with Revolut Logo */}
      <header style={{ padding: "1rem 2rem", borderBottom: "1px solid #222", display: "flex", alignItems: "center" }}>
        <img src={revolutLogo} alt="Revolut" style={{ height: "30px" }} />
        <span style={{ marginLeft: "1rem", fontSize: "18px", fontWeight: "600" }}>AutoTrader</span>
      </header>
      
      {/* Main Content Area */}
      <div style={{ display: "flex", padding: "1.5rem", gap: "1.5rem", height: "calc(100vh - 70px)" }}>
        {/* Left Panel - Blockly Workspace */}
        <div style={{ 
          flex: "4", 
          backgroundColor: "#16161A", 
          borderRadius: "12px", 
          padding: "1rem",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ flex: 1, position: "relative", minHeight: "500px" }}>
            <BlocklyWorkspace onAnalyzeTriggered={handleAnalyzeTriggered} />
          </div>
        </div>
        
        {/* Right Panel - AI Analysis */}
        <div style={{ 
          flex: "1", 
          backgroundColor: "#16161A", 
          borderRadius: "12px", 
          padding: "1rem",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#FFF", fontSize: "16px" }}>AI Analysis</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
            <button 
              onClick={handleClick}
              style={{
                backgroundColor: "#3712CB",
                color: "#FFF",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Analyze tradingbot
            </button>
            <button 
              onClick={openAnalysisModal}
              style={{
                backgroundColor: "#870BA4",
                color: "#FFF",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
                display: analysisStrategy ? "block" : "none"
              }}
            >
              View Analysis
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <pre style={{ 
              color: "#0BDF86", 
              whiteSpace: "pre-wrap", 
              fontFamily: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: "14px",
              padding: "1rem",
              backgroundColor: "#0C0C0E",
              borderRadius: "8px",
              height: "100%"
            }}>{aiOutput}</pre>
          </div>
        </div>
      </div>
      
      {/* Analysis Modal - Now as a floating overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: '#16161A',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '80%',
          maxWidth: '800px',
          maxHeight: '80vh',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #222',
            paddingBottom: '0.5rem'
          }}>
            <h2 style={{ 
              color: '#FFF', 
              fontSize: '18px', 
              fontWeight: '600',
              margin: 0 
            }}>Strategy Analysis Results</h2>
            <button onClick={() => setIsModalOpen(false)} 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem'
                    }}>×</button>
          </div>
          <div style={{
            overflowY: 'auto',
            flex: 1,
            maxHeight: 'calc(80vh - 120px)'
          }}>
            <pre style={{ 
              color: '#0BDF86', 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              padding: '1rem',
              backgroundColor: '#0C0C0E',
              borderRadius: '8px',
              margin: 0
            }}>{analysisStrategy}</pre>
          </div>
              <h1>Athena AutoTrader</h1>
              <div style={{ height: "250px"}}>
                <AssetChart />
              </div>
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #222',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button onClick={() => setIsModalOpen(false)} 
                    style={{
                      backgroundColor: '#3712CB',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>Close</button>
          </div>
        </div>
      )}
      
      {/* Semi-transparent backdrop */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
          }}
        />
      )}
    </div>
  );
}