import pytest
from pydantic import ValidationError

from schema import StrategyJson
from jsonValidator import validate_response_json


# A valid JSON example
VALID_JSON = """
{
  "tradeStrategies": [
    {
      "tradeObjects": [
        {
          "shareName": "AAPL"
        }
      ],
      "iteration": "once",
      "ifBlocks": [
        {
          "objectToConsider": "price",
          "comparisonSymbol": "<",
          "value": 160,
          "timeframe_in_seconds": "300"
        }
      ],
      "thenBlock": {
        "action": "buy",
        "unitType": "%",
        "unitValue": 20
      }
    }
  ],
  "analyzer": {
    "startDateTime": "2023-01-01T00:00:00.000Z",
    "endDateTime": "2023-12-31T00:00:00.000Z",
    "interestRate": 0.05,
    "costPerTrade": 0.02,
    "taxOnProfit": 0,
    "outputLog": [],
    "otherAnalyzers": [],
    "roi": 0.15,
    "annualizedReturn": 0.18,
    "sharpeRatio": 1.2,
    "maxDrawdown": -0.10,
    "winRate": 0.65,
    "profitFactor": 1.8
  },
  "initialBudget": 10000
}
"""

INVALID_JSON = """
{
  "tradeStrategies": [
    {
      "tradeObjects": [
        { "ticker": "AAPL" }  // ❌ not allowed
      ],
      "iteration": "once",
      "ifBlocks": [
        {
          "objectToConsider": "price",
          "comparisonSymbol": "<",
          "value": 150,
          "timeframe_in_seconds": "0"
        }
      ],
      "thenBlock": {
        "action": "buy",
        "unitType": "%",
        "unitValue": 10
      }
    }
  ],
  "analyzer": {
    "startDateTime": "2023-01-01T00:00:00.000Z",
    "endDateTime": "2023-12-31T00:00:00.000Z",
    "interestRate": 0.05,
    "costPerTrade": 0.02,
    "taxOnProfit": 0,
    "outputLog": [],
    "otherAnalyzers": [],
    "roi": 0,
    "annualizedReturn": 0,
    "sharpeRatio": 0,
    "maxDrawdown": 0,
    "winRate": 0,
    "profitFactor": 0
  },
  "initialBudget": 10000
}
"""

#VALID_JSON = INVALID_JSON


def test_valid_json_parses():
    result = validate_response_json(VALID_JSON)
    assert isinstance(result, StrategyJson)


def test_schema_rejects_invalid_field():
    broken = VALID_JSON.replace('"shareName": "AAPL"', '"ticker": "AAPL"')
    with pytest.raises(Exception) as excinfo:
        validate_response_json(broken)
    assert "Unexpected keys in tradeObject" in excinfo.value.detail


def test_schema_rejects_empty_json():
    with pytest.raises(Exception) as excinfo:
        validate_response_json('{}')
    assert "Field required" in excinfo.value.detail


def test_schema_rejects_bad_action():
    broken = VALID_JSON.replace('"action": "buy"', '"action": "hold"')  # illegal action
    with pytest.raises(Exception) as excinfo:
        validate_response_json(broken)
    assert "Input should be 'buy' or 'sell'" in excinfo.value.detail



def test_schema_rejects_malformed_json():
    with pytest.raises(Exception) as excinfo:
        validate_response_json('{not even json}')
    assert "Invalid JSON from AI" in str(excinfo.value)

