import yfinance as yf
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
import json

load_dotenv()

def get_stock_data(ticker, start_date, end_date, iteration_type='daily'):
    # Validate inputs
    if not (ticker and start_date and end_date):
        raise ValueError("Ticker, start_date, and end_date are required")

    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    delta_days = (end - start).days

    # Determine interval
    if iteration_type == "per_minute":
        if delta_days > 7:
            raise ValueError("Yahoo Finance only allows minute data for the last 7 days")
        interval = "1m"
    elif iteration_type == "per_hour":
        if delta_days > 60:
            raise ValueError("Yahoo Finance only allows hourly data for the last 60 days")
        interval = "1h"
    else:
        if delta_days > 30 * 365:
            raise ValueError("Yahoo Finance only allows data for the last 30 years")
        interval = "1d"

    # Fetch data using yfinance
    data = yf.download(ticker, start=start_date, end=end_date, interval=interval)

    if data.empty:
        raise Exception(f"No data fetched for {ticker}. Check ticker and date range.")

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = ['_'.join(col).strip() for col in data.columns.values]

    data.reset_index(inplace=True)

    close_col = f"Close_{ticker}" if f"Close_{ticker}" in data.columns else "Close"
    if close_col not in data.columns:
        raise Exception(f"'{close_col}' column not found in data.")

    # Date + Close만 저장
    filtered_data = data[["Date", close_col]].copy()
    filtered_data.rename(columns={close_col: "Close"}, inplace=True)

    records = filtered_data.to_dict(orient='records')

    # MongoDB connection
    mongo_uri = "mongodb+srv://AthenaAutoTrader:hackUPC2025winner!@athena.4buv5xy.mongodb.net/"
    client = MongoClient(mongo_uri)
    db = client["stock_db"]
    
    collection_name = ticker + "_data"
    collection = db[collection_name]

    # Insert into MongoDB
    collection.insert_many(records)
    print(f"{len(records)} records inserted into MongoDB collection '{ticker}'.")

def get_multiple_stocks(ticker_json_path, start_date, end_date, iteration_type='daily'):
    with open(ticker_json_path) as f:
        raw_data = json.load(f)

    tickers = [item["name"] for item in raw_data]

    for ticker in tickers:
        try:
            get_stock_data(ticker, start_date, end_date, iteration_type)
        except Exception as e:
            print(f"Error with {ticker}: {e}")

if __name__ == "__main__":
    start = "2020-01-01"
    end = "2025-05-02"
    stock_list = "/Users/hyeeun/Documents/HackUPC/AthenaAutoTrader/AthenaAutoTrader/src/stock_database/stock_data.json"
    get_multiple_stocks(stock_list, start, end, iteration_type="daily")