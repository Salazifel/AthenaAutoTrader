import React, { useState } from "react";
import BlocklyWorkspace from "./BlocklyWorkspace";
import revolutLogo from './assets/revolut-logo.png';

export default function App() {
  const [aiOutput, setAiOutput] = useState("Waiting for Analyze block...");

  const handleAnalyzeTriggered = (strategy) => {
    // Convert the blocks to a readable strategy description
    setAiOutput(`🔍 AI Analysis Result:\n${strategy}`);
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
        {/* Left Panel - Block Categories */}
        <div style={{ 
          flex: "1", 
          backgroundColor: "#16161A", 
          borderRadius: "12px", 
          padding: "1rem",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#FFF", fontSize: "16px" }}>Building Blocks</h3>
          <p style={{ color: "#999", fontSize: "14px", marginBottom: "1rem" }}>
            Drag blocks from here to build your trading strategies
          </p>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* This div is just a placeholder - the actual blocks will be shown by the Blockly toolbox */}
          </div>
        </div>
        
        {/* Middle Panel - Blockly Workspace */}
        <div style={{ 
          flex: "2", 
          backgroundColor: "#16161A", 
          borderRadius: "12px", 
          padding: "1rem",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#FFF", fontSize: "16px" }}>Build Your Strategy</h3>
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
    </div>
  );
}