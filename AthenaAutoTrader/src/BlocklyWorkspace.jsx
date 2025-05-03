import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import { javascriptGenerator } from 'blockly/javascript';

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
              .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
              .appendField(new Blockly.FieldDropdown([
                ["increases by", "INCREASES"],
                ["decreases by", "DECREASES"],
                ["is higher than", "HIGHER"],
                ["is lower than", "LOWER"]
              ]), "CONDITION")
              .appendField(new Blockly.FieldNumber(5), "PERCENT")
              .appendField("% in last")
              .appendField(new Blockly.FieldNumber(2), "TIMEFRAME")
              .appendField(new Blockly.FieldDropdown([
                ["days", "DAYS"],
                ["weeks", "WEEKS"],
                ["months", "MONTHS"]
              ]), "TIMEUNIT");
          this.setOutput(true, "Boolean");
          this.setColour(230);
          this.setTooltip("Check if a stock price meets a condition");
        }
      };

      // Buy/Sell/Hold actions
      ['buy', 'sell', 'hold'].forEach(action => {
        Blockly.Blocks[`${action}_action`] = {
          init: function() {
            const fields = {
              buy: { label: "BUY", color: 120 },
              sell: { label: "SELL", color: 120 },
              hold: { label: "HOLD", color: 120 }
            };
            
            this.appendDummyInput()
                .appendField(fields[action].label)
                .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK");
            
            if (action !== 'hold') {
              this.appendDummyInput()
                  .appendField(new Blockly.FieldNumber(100), "AMOUNT")
                  .appendField("shares");
            } else {
              this.appendDummyInput()
                  .appendField("for")
                  .appendField(new Blockly.FieldNumber(7), "DAYS")
                  .appendField("days");
            }
            
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(fields[action].color);
          }
        };
      });

      // If-then block with multiple actions
      Blockly.Blocks['if_then'] = {
        init: function() {
          this.appendValueInput("CONDITION")
              .setCheck("Boolean")
              .appendField("IF");
          this.appendStatementInput("THEN")
              .appendField("THEN");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(210);
          this.setTooltip("Execute multiple actions when condition is met");
        }
      };

      // Logic blocks (AND/OR)
      Blockly.Blocks['and_block'] = {
        init: function() {
          this.appendValueInput("A").setCheck("Boolean");
          this.appendValueInput("B").setCheck("Boolean").appendField("AND");
          this.setOutput(true, "Boolean");
          this.setColour(210);
        }
      };

      Blockly.Blocks['or_block'] = {
        init: function() {
          this.appendValueInput("A").setCheck("Boolean");
          this.appendValueInput("B").setCheck("Boolean").appendField("OR");
          this.setOutput(true, "Boolean");
          this.setColour(210);
        }
      };

      // Analyze block
      Blockly.Blocks['analyze_block'] = {
        init: function() {
          this.appendStatementInput("STRATEGY")
              .appendField("ANALYZE STRATEGY");
          this.setColour(60);
        }
      };
    };

    defineBlocks();

    // Define toolbox with larger categories
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#5C81A6',
          cssConfig: {
            container: 'category-conditions',
            icon: 'category-icon-conditions'
          },
          contents: [
            { kind: 'block', type: 'price_condition' }
          ]
        },
        {
          kind: 'category',
          name: 'Actions',
          colour: '#5CA65C',
          cssConfig: {
            container: 'category-actions',
            icon: 'category-icon-actions'
          },
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
          cssConfig: {
            container: 'category-logic',
            icon: 'category-icon-logic'
          },
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
          cssConfig: {
            container: 'category-controls',
            icon: 'category-icon-controls'
          },
          contents: [
            { kind: 'block', type: 'analyze_block' }
          ]
        }
      ]
    };

    // Create workspace with custom styling
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.2 },
      move: { scrollbars: true, drag: true, wheel: true },
      trashcan: true,
      theme: Blockly.Themes.Dark,
      renderer: 'zelos'
    });

    // Add CSS for larger toolbox categories
    const style = document.createElement('style');
    style.textContent = `
      .blocklyToolboxContents {
        padding: 8px !important;
      }
      .blocklyTreeRow {
        padding: 12px 16px !important;
        margin-bottom: 4px !important;
        border-radius: 4px !important;
      }
      .blocklyTreeRowContentContainer {
        font-size: 16px !important;
        font-weight: 500 !important;
      }
      .blocklyText {
        font-size: 14px !important;
      }
      .blocklyFlyoutLabel {
        font-size: 14px !important;
      }
    `;
    document.head.appendChild(style);

    // Handle analyze button
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