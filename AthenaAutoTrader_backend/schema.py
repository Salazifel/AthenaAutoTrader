from typing import List, Literal, Union
from pydantic import BaseModel, Field
from datetime import datetime


class TradeObject(BaseModel):
    shareName: str


class IfBlock(BaseModel):
    objectToConsider: Literal["price", "percentage"]  # expand if more are added
    comparisonSymbol: Literal["<", ">", "<=", ">=", "==", "!="]
    value: Union[int, float]
    timeframe_in_seconds: str


class ThenBlock(BaseModel):
    action: Literal["buy", "sell"]
    unitType: Literal['%', 'shares', 'absolute']
    unitValue: Union[int, float]


class TradeStrategy(BaseModel):
    tradeObjects: List[TradeObject]
    iteration: Literal["once", "per_day", "per_week", "per_month"]
    ifBlocks: List[IfBlock]
    thenBlock: ThenBlock

class Analyzer(BaseModel):
    startDateTime: datetime
    endDateTime: datetime
    interestRate: float
    costPerTrade: float
    outputLog: List = Field(default_factory=list) # must be empty at the start
    cashLog : List = Field(default_factory=list) # must be empty at the start
    porfolioLog : List = Field(default_factory=list) # must be empty at the start
    otherAnalyzers: List = Field(default_factory=list) # must be empty at the start

    roi: float = 0.0 # must be empty at the start
    sharpeRatio: float = 0.0 # must be empty at the start
    maxDrawdown: float = 0.0 # must be empty at the start
    winRate: float = 0.0 # must be empty at the start
    profitFactor: float = 0.0 # must be empty at the start
    annualizedReturn: float = 0.0 # must be empty at the start

class TradeStrategyCollector(BaseModel):
    tradeStrategies: List[TradeStrategy] = Field(default_factory=list) # must be empty at the start
    initialBudget: float = 0.0 # must be empty at the start
    analyzer: Analyzer

class StrategyJson(BaseModel):
    tradeStrategies: List[TradeStrategy]
    analyzer: Analyzer
    initialBudget: float
