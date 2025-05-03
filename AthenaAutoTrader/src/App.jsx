import React, { useState } from "react";
import BlocklyWorkspace from "./BlocklyWorkspace";
import AnalysisModal from "./AnalysisModal";
import revolutLogo from './assets/revolut-logo.png';
import { generateAIResponse } from "./geminiApi";

export default function App() {
  const [aiOutput, setAiOutput] = useState("Waiting for Analyze block...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisStrategy, setAnalysisStrategy] = useState("");

  const handleClick = async () => {
    const tradingBotJson = "{\n \"tradeStrategies\": [\n {\n \"tradeObjects\": [\n {\n \"shareName\": \"AAPL\"\n }\n ],\n \"iteration\": \"once\",\n \"ifBlocks\": [\n {\n \"objectToConsider\": \"price\",\n \"comparisonSymbol\": \">\",\n \"value\": 100,\n \"timeframe_in_seconds\": \"0\"\n }\n ],\n \"thenBlock\": {\n \"action\": \"buy\",\n \"unitType\": \"%\",\n \"unitValue\": 10\n }\n },\n {\n \"tradeObjects\": [\n {\n \"shareName\": \"AAPL\"\n }\n ],\n \"iteration\": \"once\",\n \"ifBlocks\": [\n {\n \"objectToConsider\": \"price\",\n \"comparisonSymbol\": \"<\",\n \"value\": 150,\n \"timeframe_in_seconds\": \"0\"\n }\n ],\n \"thenBlock\": {\n \"action\": \"sell\",\n \"unitType\": \"%\",\n \"unitValue\": 5\n }\n }\n ],\n \"analyzer\": {\n \"startDateTime\": \"2023-01-01T00:00:00.000Z\",\n \"endDateTime\": \"2023-12-31T00:00:00.000Z\",\n \"interestRate\": 0.05,\n \"costPerTrade\": 0.02,\n \"taxOnProfit\": 0,\n \"outputLog\": [],\n \"otherAnalyzers\": [],\n \"roi\": 0,\n \"annualizedReturn\": 0,\n \"sharpeRatio\": 0,\n \"maxDrawdown\": 0,\n \"winRate\": 0,\n \"profitFactor\": 0\n },\n \"initialBudget\": 10000\n}";
    setAiOutput(
      "Running analysis... Please wait."
    );
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
      Return only the improved JSON. Stop-losses should be implemented using the same logic structure (e.g. a new tradeStrategy that sells a portion of holdings if the price falls below a certain threshold after a buy). Time-based logic can be handled by modifying or setting timeframe_in_seconds. `);

    if (typeof aiResponse === "string") {
      setAiOutput("No response from Gemini");
    } else {
      setAiOutput(JSON.stringify(aiResponse, null, 2));
      // Open the modal with the response
      setAnalysisStrategy(JSON.stringify(aiResponse, null, 2));
      setIsModalOpen(true);
    }
  };

  const handleAnalyzeTriggered = (strategy) => {
    // Convert the blocks to a readable strategy description
    const analysisResult = `AI Analysis Result:\n${strategy}`;
    setAiOutput(analysisResult);
    setAnalysisStrategy(analysisResult);
    // Don't open modal automatically - wait for button click
  };

  const openAnalysisModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ backgroundColor: "#0C0C0E", minHeight: "100vh", color: "#fff", fontFamily: "SF Pro Display, sans-serif" }}>
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
      
      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        analysisContent={analysisStrategy} 
      />
    </div>
  );
}