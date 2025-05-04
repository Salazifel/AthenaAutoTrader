import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import { javascriptGenerator } from 'blockly/javascript';
import { parseStrategyToJson } from './utils/strategyParser';


class StockDropdownField extends Blockly.FieldDropdown {
  constructor(options) {
    super(options);
    this.stockData = [];
    this.loadStockData();
  }

  async loadStockData() {
    try {
      // Use correct path for Vite - adjust if needed
      const response = await fetch('/src/stock_database/stock_data.json');
      if (!response.ok) throw new Error('Failed to load');
      this.stockData = await response.json();
      this.updateOptions();
    } catch (error) {
      console.error('Error loading stock data:', error);
      this.menuGenerator_ = [['Error loading stocks', '']];
    }
    
  }

  updateOptions() {
    const stocks = this.stockData.filter(item => item.type === 'stock');
    const etfs = this.stockData.filter(item => item.type === 'etf');
    
    const options = [
      ['Select stock/ETF...', ''],
      ['──────────', '']
    ];
    
    if (stocks.length > 0) {
      options.push(['STOCKS', '']);
      options.push(...stocks.map(stock => [`• ${stock.name}`, stock.name]));
    }
    
    if (etfs.length > 0) {
      options.push(['──────────', '']);
      options.push(['ETFs', '']);
      options.push(...etfs.map(etf => [`• ${etf.name}`, etf.name]));
    }
    
    this.menuGenerator_ = options;
  }
  onItemSelected_(menu, menuItem) {
    if (menuItem.value_ === null || menuItem.value_ === '') return; // Ignore dividers and headers
    super.onItemSelected_(menu, menuItem);
  }
}

const BlocklyWorkspace = ({ onAnalyzeTriggered }) => {
  const blocklyDiv = useRef(null);
  const [hasAnalyzeBlock, setHasAnalyzeBlock] = useState(false);

  const handleAnalyzeClick = (workspace) => {
    if (!hasAnalyzeBlock) return;
    
    try {
      const code = javascriptGenerator.workspaceToCode(workspace);
      console.log("Generated code:", code);
      
      const strategyJson = parseStrategyToJson(code);
      console.log("Parsed JSON:", strategyJson);
      
      onAnalyzeTriggered(strategyJson);
    } catch (error) {
      console.error("Error generating code:", error);
      onAnalyzeTriggered("Error generating code: " + error.message);
    }
  };
  
  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Register JavaScript generators first (before block definitions)
    javascriptGenerator.forBlock['price_condition'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const condition = block.getFieldValue('CONDITION');
      const percent = block.getFieldValue('PERCENT');
      const timeframe = block.getFieldValue('TIMEFRAME');
      const timeunit = block.getFieldValue('TIMEUNIT');
      return [`${stock} ${condition.toLowerCase()} ${percent}% in last ${timeframe} ${timeunit.toLowerCase()}`, javascriptGenerator.ORDER_ATOMIC];
    };
    
    ['buy', 'sell', 'hold'].forEach(action => {
      javascriptGenerator.forBlock[`${action}_action`] = function(block) {
        const stock = block.getFieldValue('STOCK');
        if (action === 'hold') {
          const days = block.getFieldValue('DAYS');
          return `HOLD ${stock} for ${days} days;\n`;
        } else {
          const amount = block.getFieldValue('AMOUNT');
          return `${action.toUpperCase()} ${amount} shares of ${stock};\n`;
        }
      };
    });
    
    javascriptGenerator.forBlock['if_then'] = function(block) {
      const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC);
      const thenCode = javascriptGenerator.statementToCode(block, 'THEN');
      return `IF ${condition} THEN:\n${thenCode}`;
    };
    
    javascriptGenerator.forBlock['and_block'] = function(block) {
      const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC);
      const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC);
      return [`(${a} AND ${b})`, javascriptGenerator.ORDER_ATOMIC];
    };
    
    javascriptGenerator.forBlock['or_block'] = function(block) {
      const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC);
      const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC);
      return [`(${a} OR ${b})`, javascriptGenerator.ORDER_ATOMIC];
    };
    
    javascriptGenerator.forBlock['analyze_block'] = function(block) {
      const strategy = javascriptGenerator.statementToCode(block, 'STRATEGY');
      const startDate = block.getFieldValue('START_DATE');
      const endDate = block.getFieldValue('END_DATE');
      const initialBudget = block.getFieldValue('INITIAL_BUDGET');
      const interestRate = block.getFieldValue('INTEREST_RATE');
      const costPerTrade = block.getFieldValue('COST_PER_TRADE');
      
      return `STRATEGY TO ANALYZE:\n${strategy}\n` +
        `Analysis Parameters:\n` +
        `- Start Date: ${startDate}\n` +
        `- End Date: ${endDate}\n` +
        `- Initial Budget: ${initialBudget} EUR\n` +
        `- Interest Rate: ${interestRate}%\n` +
        `- Cost Per Trade: ${costPerTrade} EUR\n`
    };

    const createDateField = () => {
      return new Blockly.FieldTextInput(
        new Date().toLocaleDateString(), // Use locale-specific format
        function(text) {
          // Try parsing in multiple formats
          const parsedDate = new Date(text);
          if (isNaN(parsedDate.getTime())) {
            return null; // Invalid date
          }
          return parsedDate;
        }
      );
    };

    // Define custom blocks
    const defineBlocks = () => {
      // Price condition block
      Blockly.Blocks['price_condition'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("IF")
              .appendField(new StockDropdownField([['Loading...', '']]), "STOCK")
              .appendField(new Blockly.FieldDropdown([
                ["increases by", "INCREASES"],
                ["decreases by", "DECREASES"],
                ["is higher than", "HIGHER"],
                ["is lower than", "LOWER"]
              ]), "CONDITION")
              .appendField(new Blockly.FieldNumber(5, 0), "PERCENT")
              .appendField("% in last")
              .appendField(new Blockly.FieldNumber(2, 1), "TIMEFRAME")
              .appendField(new Blockly.FieldDropdown([
                ["days", "DAYS"],
                ["weeks", "WEEKS"],
                ["months", "MONTHS"]
              ]), "TIMEUNIT");
          
          this.setOutput(true, "Boolean");
          this.setColour("#3712CB");
          this.setTooltip("Check if a stock price meets a condition");
        }
      };

      // Buy/Sell/Hold actions with stock dropdown
      ['buy', 'sell', 'hold'].forEach(action => {
        Blockly.Blocks[`${action}_action`] = {
          init: function() {
            const fields = {
              buy: { label: "BUY", color: '#1D1E26'},
              sell: { label: "SELL", color: '#1D1E26' },
              hold: { label: "HOLD", color: '#1D1E26' }
            };
            
            this.appendDummyInput()
                .appendField(fields[action].label)
                .appendField(new StockDropdownField([['Loading...', '']]), "STOCK");
            
            if (action !== 'hold') {
              this.appendDummyInput()
                  .appendField(new Blockly.FieldNumber(100, 0), "AMOUNT")
                  .appendField("shares");
            } else {
              this.appendDummyInput()
                  .appendField("for")
                  .appendField(new Blockly.FieldNumber(7, 1), "DAYS")
                  .appendField("days");
            }
            
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(fields[action].color);
          }
        };
      });

      // If-then block
      Blockly.Blocks['if_then'] = {
        init: function() {
          this.appendValueInput("CONDITION")
              .setCheck("Boolean")
              .appendField("IF");
          this.appendStatementInput("THEN")
              .appendField("THEN");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour("#808080");
          this.setTooltip("Execute multiple actions when condition is met");
        }
      };

      // Logic blocks
      Blockly.Blocks['and_block'] = {
        init: function() {
          this.appendValueInput("A").setCheck("Boolean");
          this.appendValueInput("B").setCheck("Boolean").appendField("AND");
          this.setOutput(true, "Boolean");
          this.setColour("#808080");
        }
      };

      Blockly.Blocks['or_block'] = {
        init: function() {
          this.appendValueInput("A").setCheck("Boolean");
          this.appendValueInput("B").setCheck("Boolean").appendField("OR");
          this.setOutput(true, "Boolean");
          this.setColour("#808080");
        }
      };

      // Enhanced Analyze block with parameters
      Blockly.Blocks['analyze_block'] = {
        init: function() {
          this.appendStatementInput("STRATEGY")
              .appendField("ANALYZE STRATEGY");
          
          // Add parameters as input fields
          this.appendDummyInput()
              .appendField("Start Date:")
              .appendField(createDateField(), "START_DATE");
          
          this.appendDummyInput()
              .appendField("End Date:")
              .appendField(createDateField(), "END_DATE");

          this.appendDummyInput()
              .appendField("Initial Budget:")
              .appendField(new Blockly.FieldNumber(0, 0), "INITIAL_BUDGET")
              .appendField("EUR");
          
          this.appendDummyInput()
              .appendField("Interest Rate:")
              .appendField(new Blockly.FieldNumber(5, 0, 100, 0.1), "INTEREST_RATE")
              .appendField("%");
            
            this.appendDummyInput()
              .appendField("Cost Per Trade:")
              .appendField(new Blockly.FieldNumber(0, 0, Infinity, 0.01), "COST_PER_TRADE")
              .appendField("EUR");

          this.setColour("#870BA4");
          this.setTooltip("Analyze your trading strategy with custom parameters");
        }
      };
    };

    defineBlocks();

    // Define toolbox
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'price_condition' }
          ]
        },
        {
          kind: 'category',
          name: 'Actions',
          colour: '#5CA65C',
          contents: [
            { kind: 'block', type: 'buy_action' },
            { kind: 'block', type: 'sell_action' },
            { kind: 'block', type: 'hold_action' }
          ]
        },
        {
          kind: 'category',
          name: 'Logic',
          colour: '#A65C81',
          contents: [
            { kind: 'block', type: 'if_then' },
            { kind: 'block', type: 'and_block' },
            { kind: 'block', type: 'or_block' }
          ]
        },
        {
          kind: 'category',
          name: 'Controls',
          colour: '#A6835C',
          contents: [
            { kind: 'block', type: 'analyze_block' }
          ]
        }
      ]
    };

    // Create workspace with proper configuration
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0 },
      move: { 
        scrollbars: true,
        drag: true,
        wheel: true
      },
      trashcan: true,
      theme: Blockly.Themes.Dark,
      renderer: 'zelos'
    });

    // Add CSS for proper display
    const style = document.createElement('style');
    style.textContent = `
      .blocklyToolboxDiv {
        width: 220px !important;
        overflow: visible !important;
        background-color: #2d2d2d !important;
      }
      .blocklyTreeRow {
        padding: 12px 16px !important;
        margin-bottom: 4px !important;
        border-radius: 4px !important;
        height: auto !important;
      }
      .blocklyTreeRowContentContainer {
        font-size: 16px !important;
        font-weight: 500 !important;
      }
      .blocklyText {
        font-size: 14px !important;
      }
      .blocklyFlyout {
        margin-left: 100px !important;
        background-color: transparent !important;
      }
      .blocklyMainBackground {
        fill:rgb(245, 242, 242) !important;
      }
      .analyze-button {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background-color: #870BA4;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 100;
        display: none;
      }
      .analyze-button:hover {
        background-color: #9B1AC6;
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
      }
      .analyze-button.visible {
        display: block;
      }
    `;
    document.head.appendChild(style);

    // Add analyze button
    const analyzeButton = document.createElement('button');
    analyzeButton.className = 'analyze-button';
    analyzeButton.textContent = 'Analyze Strategy';
    blocklyDiv.current.appendChild(analyzeButton);

    // Handle analyze block detection
    workspace.addChangeListener((event) => {
      if (event.type === Blockly.Events.BLOCK_CREATE || 
          event.type === Blockly.Events.BLOCK_DELETE || 
          event.type === Blockly.Events.BLOCK_CHANGE) {
        
        const analyzeBlocks = workspace.getBlocksByType('analyze_block');
        const hasAnalyze = analyzeBlocks.length > 0;
        
        setHasAnalyzeBlock(hasAnalyze);
        
        // Show or hide analyze button
        if (hasAnalyze) {
          analyzeButton.classList.add('visible');
        } else {
          analyzeButton.classList.remove('visible');
        }
      }
    });

    analyzeButton.addEventListener('click', () => handleAnalyzeClick(workspace));

    return () => {
      workspace.dispose();
      document.head.removeChild(style);
      if (blocklyDiv.current && blocklyDiv.current.contains(analyzeButton)) {
        blocklyDiv.current.removeChild(analyzeButton);
      }
    };
  }, [onAnalyzeTriggered, hasAnalyzeBlock]);

  return <div ref={blocklyDiv} style={{ width: '100%', height: '100%', position: 'relative' }} />;
};


export default BlocklyWorkspace;