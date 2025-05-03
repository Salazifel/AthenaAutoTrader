import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import { javascriptGenerator } from 'blockly/javascript';

const BlocklyWorkspace = ({ onAnalyzeTriggered }) => {
  const blocklyDiv = useRef(null);
  const toolboxDiv = useRef(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;
    
    // Define custom blocks
    defineBlocks();
    
    // Define the toolbox XML - this controls what appears in the left panel
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'price_condition' },
            { kind: 'block', type: 'moving_average_condition' },
            { kind: 'block', type: 'volume_condition' },
            { kind: 'block', type: 'rsi_condition' },
          ]
        },
        {
          kind: 'category',
          name: 'Actions',
          colour: '#5CA65C',
          contents: [
            { kind: 'block', type: 'buy_action' },
            { kind: 'block', type: 'sell_action' },
            { kind: 'block', type: 'hold_action' },
          ]
        },
        {
          kind: 'category',
          name: 'Logic',
          colour: '#A65C81',
          contents: [
            { kind: 'block', type: 'if_then' },
            { kind: 'block', type: 'and_block' },
            { kind: 'block', type: 'or_block' },
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

    // Create the Blockly workspace
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      },
      trashcan: true,
      theme: 'dark',
    });

    // Add change listener to detect when analyze block is used
    workspace.addChangeListener((event) => {
      if (event.type === Blockly.Events.BLOCK_CHANGE || 
          event.type === Blockly.Events.BLOCK_CREATE || 
          event.type === Blockly.Events.BLOCK_DELETE ||
          event.type === Blockly.Events.BLOCK_MOVE) {
            
        // Check if there's an analyze block connected to something
        const analyzeBlocks = workspace.getBlocksByType('analyze_block', false);
        
        if (analyzeBlocks && analyzeBlocks.length > 0) {
          // Find if there's a strategy connected to this analyze block
          const analyzeBlock = analyzeBlocks[0];
          
          if (analyzeBlock.getInputTargetBlock('STRATEGY')) {
            const strategy = generateCodeFromBlocks(workspace);
            if (strategy) {
              onAnalyzeTriggered(strategy);
            }
          }
        }
      }
    });

    return () => {
      workspace.dispose();
    };
  }, [onAnalyzeTriggered]);

  // Function to define custom blocks
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
            .appendField(new Blockly.FieldNumber(5, 0, 100), "PERCENT")
            .appendField("%")
            .appendField("in last")
            .appendField(new Blockly.FieldNumber(2, 1, 52), "TIMEFRAME")
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

    // Moving average condition
    Blockly.Blocks['moving_average_condition'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("IF")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField(new Blockly.FieldDropdown([
              ["20-day", "20"],
              ["50-day", "50"],
              ["200-day", "200"]
            ]), "MA_PERIOD")
            .appendField("MA")
            .appendField(new Blockly.FieldDropdown([
              ["crosses above", "ABOVE"],
              ["crosses below", "BELOW"],
              ["is trending up", "TREND_UP"],
              ["is trending down", "TREND_DOWN"]
            ]), "CONDITION");
        this.setOutput(true, "Boolean");
        this.setColour(230);
      }
    };

    // Volume condition
    Blockly.Blocks['volume_condition'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("IF")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField("volume")
            .appendField(new Blockly.FieldDropdown([
              ["increases by", "INCREASES"],
              ["is higher than", "HIGHER"]
            ]), "CONDITION")
            .appendField(new Blockly.FieldNumber(50, 0), "PERCENT")
            .appendField("% avg");
        this.setOutput(true, "Boolean");
        this.setColour(230);
      }
    };

    // RSI condition
    Blockly.Blocks['rsi_condition'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("IF")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField("RSI")
            .appendField(new Blockly.FieldDropdown([
              ["above", "ABOVE"],
              ["below", "BELOW"]
            ]), "CONDITION")
            .appendField(new Blockly.FieldNumber(70, 0, 100), "VALUE");
        this.setOutput(true, "Boolean");
        this.setColour(230);
      }
    };

    // Buy action
    Blockly.Blocks['buy_action'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("BUY")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField(new Blockly.FieldNumber(100), "AMOUNT")
            .appendField("shares");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
      }
    };

    // Sell action
    Blockly.Blocks['sell_action'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("SELL")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField(new Blockly.FieldNumber(100), "AMOUNT")
            .appendField("shares");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
      }
    };

    // Hold action
    Blockly.Blocks['hold_action'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("HOLD")
            .appendField(new Blockly.FieldTextInput("AAPL"), "STOCK")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(7, 1), "DAYS")
            .appendField("days");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
      }
    };

    // If-Then block
    Blockly.Blocks['if_then'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("IF");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("THEN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
      }
    };

    // AND logic block
    Blockly.Blocks['and_block'] = {
      init: function() {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendValueInput("B")
            .setCheck("Boolean")
            .appendField("AND");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      }
    };

    // OR logic block
    Blockly.Blocks['or_block'] = {
      init: function() {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendValueInput("B")
            .setCheck("Boolean")
            .appendField("OR");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      }
    };

    // Analyze block
    Blockly.Blocks['analyze_block'] = {
      init: function() {
        this.appendStatementInput("STRATEGY")
            .setCheck(null)
            .appendField("ANALYZE STRATEGY");
        this.setColour(60);
        this.setTooltip("Connect your trading strategy to this block for AI analysis");
      }
    };

    // Define JavaScript generators for blocks
    defineJavascriptGenerators();
  };

  // Define JavaScript generators for the custom blocks
  const defineJavascriptGenerators = () => {
    javascriptGenerator['price_condition'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const condition = block.getFieldValue('CONDITION');
      const percent = block.getFieldValue('PERCENT');
      const timeframe = block.getFieldValue('TIMEFRAME');
      const timeunit = block.getFieldValue('TIMEUNIT');
      
      return [`${stock} ${condition.toLowerCase()} ${percent}% in last ${timeframe} ${timeunit.toLowerCase()}`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['moving_average_condition'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const period = block.getFieldValue('MA_PERIOD');
      const condition = block.getFieldValue('CONDITION');
      
      let conditionText = '';
      switch(condition) {
        case 'ABOVE': conditionText = 'crosses above'; break;
        case 'BELOW': conditionText = 'crosses below'; break;
        case 'TREND_UP': conditionText = 'is trending up'; break;
        case 'TREND_DOWN': conditionText = 'is trending down'; break;
      }
      
      return [`${stock} ${period}-day MA ${conditionText}`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['volume_condition'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const condition = block.getFieldValue('CONDITION');
      const percent = block.getFieldValue('PERCENT');
      
      let conditionText = condition === 'INCREASES' ? 'increases by' : 'is higher than';
      
      return [`${stock} volume ${conditionText} ${percent}% of average`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['rsi_condition'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const condition = block.getFieldValue('CONDITION');
      const value = block.getFieldValue('VALUE');
      
      let conditionText = condition === 'ABOVE' ? 'above' : 'below';
      
      return [`${stock} RSI is ${conditionText} ${value}`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['buy_action'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const amount = block.getFieldValue('AMOUNT');
      
      return `BUY ${amount} shares of ${stock};\n`;
    };

    javascriptGenerator['sell_action'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const amount = block.getFieldValue('AMOUNT');
      
      return `SELL ${amount} shares of ${stock};\n`;
    };

    javascriptGenerator['hold_action'] = function(block) {
      const stock = block.getFieldValue('STOCK');
      const days = block.getFieldValue('DAYS');
      
      return `HOLD ${stock} for ${days} days;\n`;
    };

    javascriptGenerator['if_then'] = function(block) {
      const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_NONE) || 'true';
      const statements = javascriptGenerator.statementToCode(block, 'DO');
      
      return `WHEN ${condition} THEN:\n${statements}`;
    };

    javascriptGenerator['and_block'] = function(block) {
      const valueA = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_NONE) || 'true';
      const valueB = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_NONE) || 'true';
      
      return [`${valueA} AND ${valueB}`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['or_block'] = function(block) {
      const valueA = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_NONE) || 'true';
      const valueB = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_NONE) || 'true';
      
      return [`${valueA} OR ${valueB}`, javascriptGenerator.ORDER_ATOMIC];
    };

    javascriptGenerator['analyze_block'] = function(block) {
      const strategy = javascriptGenerator.statementToCode(block, 'STRATEGY');
      return `ANALYZE STRATEGY:\n${strategy}`;
    };
  };

  // Function to generate code from blocks
  const generateCodeFromBlocks = (workspace) => {
    const analyzeBlocks = workspace.getBlocksByType('analyze_block', false);
    if (analyzeBlocks.length === 0) return '';
    
    const code = javascriptGenerator.blockToCode(analyzeBlocks[0]);
    return code;
  };

  return (
    <div ref={blocklyDiv} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
  );
};

export default BlocklyWorkspace;