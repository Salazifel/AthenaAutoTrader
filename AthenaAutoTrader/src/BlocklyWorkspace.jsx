import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import { javascriptGenerator } from 'blockly/javascript';

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

  useEffect(() => {
    if (!blocklyDiv.current) return;

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

      // Analyze block
      Blockly.Blocks['analyze_block'] = {
        init: function() {
          this.appendStatementInput("STRATEGY")
              .appendField("ANALYZE STRATEGY");
          this.setColour("#870BA4");
        }
      };

      // Define JavaScript generators
      javascriptGenerator['price_condition'] = function(block) {
        const stock = block.getFieldValue('STOCK');
        const condition = block.getFieldValue('CONDITION');
        const percent = block.getFieldValue('PERCENT');
        const timeframe = block.getFieldValue('TIMEFRAME');
        const timeunit = block.getFieldValue('TIMEUNIT');
        return [`${stock} ${condition.toLowerCase()} ${percent}% in last ${timeframe} ${timeunit.toLowerCase()}`, javascriptGenerator.ORDER_ATOMIC];
      };

      ['buy', 'sell', 'hold'].forEach(action => {
        javascriptGenerator[`${action}_action`] = function(block) {
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
    `;
    document.head.appendChild(style);

    // Handle analyze
    workspace.addChangeListener((event) => {
      const analyzeBlocks = workspace.getBlocksByType('analyze_block');
      if (analyzeBlocks.length > 0) {
        const code = javascriptGenerator.workspaceToCode(workspace);
        onAnalyzeTriggered(code);
      }
    });

    return () => {
      workspace.dispose();
      document.head.removeChild(style);
    };
  }, [onAnalyzeTriggered]);

  return <div ref={blocklyDiv} style={{ width: '100%', height: '100%' }} />;
};

export default BlocklyWorkspace;