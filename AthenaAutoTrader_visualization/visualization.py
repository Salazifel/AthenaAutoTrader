from matplotlib.ticker import ScalarFormatter
import matplotlib.pyplot as plt
import json
from datetime import datetime
import os


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

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(dates, values, marker="o", label="Total Asset")
    ax.set_title("Total Asset Over Time")
    ax.set_xlabel("Date")
    ax.set_ylabel("Total Value (USD)")

    ax.yaxis.set_major_formatter(ScalarFormatter(useOffset=False))
    ax.ticklabel_format(style="plain", axis="y")
    y_min = min(values)
    y_max = max(values)
    y_range = y_max - y_min
    ax.set_ylim(y_min - y_range * 2, y_max + y_range * 2)

    ax.grid(True)
    ax.legend()
    plt.tight_layout()
    plt.savefig("total_asset_over_time.png", dpi=300)


DATA_DIR = os.path.join(os.path.dirname(__file__))

total_value_file = os.path.join(DATA_DIR, "tradeStrategyPortfolioValue.json")
cash_file = os.path.join(DATA_DIR, "tradeStrategyCashLogs.json")
plot_total_assets(total_value_file, cash_file)
