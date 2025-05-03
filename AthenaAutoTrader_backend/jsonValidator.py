import json
from fastapi import HTTPException
from pydantic import ValidationError
from typing import Any

from schema import StrategyJson  # adjust this if your schema file is elsewhere

# Define allowed JSON keys at all levels
ALLOWED_TOP_LEVEL_KEYS = {"tradeStrategies", "analyzer", "initialBudget"}
ALLOWED_STRATEGY_KEYS = {"tradeObjects", "iteration", "ifBlocks", "thenBlock"}
ALLOWED_IFBLOCK_KEYS = {"objectToConsider", "comparisonSymbol", "value", "timeframe_in_seconds"}
ALLOWED_THENBLOCK_KEYS = {"action", "unitType", "unitValue"}
ALLOWED_ANALYZER_KEYS = {
    "startDateTime", "endDateTime", "interestRate", "costPerTrade", "taxOnProfit",
    "outputLog", "otherAnalyzers", "roi", "annualizedReturn", "sharpeRatio",
    "maxDrawdown", "winRate", "profitFactor"
}
ALLOWED_TRADEOBJECT_KEYS = {"shareName"}


def _assert_only_allowed_keys(data: Any):
    if not isinstance(data, dict):
        raise ValueError("Top-level JSON must be a dictionary")

    extra_top = set(data.keys()) - ALLOWED_TOP_LEVEL_KEYS
    if extra_top:
        raise ValueError(f"Unexpected top-level keys: {extra_top}")

    for strategy in data.get("tradeStrategies", []):
        extra_strategy = set(strategy.keys()) - ALLOWED_STRATEGY_KEYS
        if extra_strategy:
            raise ValueError(f"Unexpected keys in trade strategy: {extra_strategy}")

        for obj in strategy.get("tradeObjects", []):
            extra_obj = set(obj.keys()) - ALLOWED_TRADEOBJECT_KEYS
            if extra_obj:
                raise ValueError(f"Unexpected keys in tradeObject: {extra_obj}")

        for ifblock in strategy.get("ifBlocks", []):
            extra_if = set(ifblock.keys()) - ALLOWED_IFBLOCK_KEYS
            if extra_if:
                raise ValueError(f"Unexpected keys in ifBlock: {extra_if}")

        thenblock = strategy.get("thenBlock", {})
        extra_then = set(thenblock.keys()) - ALLOWED_THENBLOCK_KEYS
        if extra_then:
            raise ValueError(f"Unexpected keys in thenBlock: {extra_then}")

    analyzer = data.get("analyzer", {})
    extra_analyzer = set(analyzer.keys()) - ALLOWED_ANALYZER_KEYS
    if extra_analyzer:
        raise ValueError(f"Unexpected keys in analyzer: {extra_analyzer}")


def validate_response_json(response_text: str) -> StrategyJson:
    """
    Validates and parses the response JSON string from the AI.

    Returns:
        StrategyJson: A validated model instance

    Raises:
        HTTPException: if the JSON is invalid or does not match schema or key whitelist
    """
    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError as e:
        msg = f"Invalid JSON from AI: {e}"
        print("❌", msg)
        raise HTTPException(status_code=400, detail=msg)

    try:
        _assert_only_allowed_keys(parsed)
    except ValueError as e:
        msg = f"JSON contains disallowed keys: {e}"
        print("❌", msg)
        raise HTTPException(status_code=400, detail=msg)

    try:
        validated = StrategyJson.model_validate(parsed)
    except ValidationError as e:
        msg = f"Schema validation failed: {e}"
        print("❌", msg)
        raise HTTPException(status_code=400, detail=msg)

    return validated
