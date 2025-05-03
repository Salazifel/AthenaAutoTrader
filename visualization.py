import json
from datetime import datetime
import matplotlib.pyplot as plt


def plot_total_assets(total_value_file, cash_file):
    with open(total_value_file, "r") as f:
        total_value_data = json.load(f)

    with open(cash_file, "r") as f:
        cash_data = json.load(f)

    total_value_map = {
        datetime.strptime(entry["timestamp"], "%Y-%m-%dT%H:%M:%S.%fZ").strftime(
            "%Y-%m-%d"
        ): entry["totalValue"]
        for entry in total_value_data
    }

    cash_map = {
        datetime.strptime(entry["timestamp"], "%Y-%m-%dT%H:%M:%S.%fZ").strftime(
            "%Y-%m-%d"
        ): entry["cash"]
        for entry in cash_data
    }

    all_timestamps = set(total_value_map.keys()) | set(cash_map.keys())

    combined = []
    for ts in all_timestamps:
        total = 0
        if ts in cash_map:
            total += cash_map[ts]
        if ts in total_value_map:
            total += total_value_map[ts]

        combined.append((ts, total))

    combined.sort(key=lambda x: x[0])
    dates = [dt for dt, _ in combined]
    values = [val for _, val in combined]

    # 그래프 그리기
    plt.figure(figsize=(10, 5))
    plt.plot(dates, values, marker="o", label="Total Asset")
    plt.title("Total Asset Over Time")
    plt.xlabel("Date")
    plt.ylabel("Total Value (USD)")
    plt.grid(True)
    plt.legend()

    plt.tight_layout()
    plt.show()


total_value = (
    "/Users/hyeeun/Documents/HackUPC/AthenaAutoTrader/tradeStrategyPortfolioValue.json"
)
cash = "/Users/hyeeun/Documents/HackUPC/AthenaAutoTrader/tradeStrategyCashLogs.json"
plot_total_assets(total_value, cash)
