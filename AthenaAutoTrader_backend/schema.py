from typing import List, Literal, Union
from pydantic import BaseModel, Field


class TradeObject(BaseModel):
    shareName: str


class IfBlock(BaseModel):
    objectToConsider: Literal["price"]  # expand if more are added
    comparisonSymbol: Literal["<", ">", "<=", ">=", "==", "!="]
    value: Union[int, float]
    timeframe_in_seconds: str  # if always string in input, else make this Union[str, int]


class ThenBlock(BaseModel):
    action: Literal["buy", "sell"]
    unitType: Literal['%', 'units', 'absolute']
    unitValue: Union[int, float]


class TradeStrategy(BaseModel):
    tradeObjects: List[TradeObject]
    iteration: Literal["once", "loop"]
    ifBlocks: List[IfBlock]
    thenBlock: ThenBlock


class Analyzer(BaseModel):
    startDateTime: str
    endDateTime: str
    interestRate: float
    costPerTrade: float
    taxOnProfit: float
    outputLog: List = Field(default_factory=list)
    otherAnalyzers: List = Field(default_factory=list)
    roi: float
    annualizedReturn: float
    sharpeRatio: float
    maxDrawdown: float
    winRate: float
    profitFactor: float


class StrategyJson(BaseModel):
    tradeStrategies: List[TradeStrategy]
    analyzer: Analyzer
    initialBudget: float
