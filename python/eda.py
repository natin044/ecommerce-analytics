"""
Exploratory Data Analysis for E-Commerce Dataset
Generates summary statistics and charts.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
SCREENSHOTS_DIR = Path(__file__).resolve().parent.parent / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)


def run_eda():
    print("=" * 60)
    print("Exploratory Data Analysis")
    print("=" * 60)

    csv_files = list(RAW_DIR.glob("*.csv"))
    if not csv_files:
        print("No raw CSV files found in data/raw/")
        print("Please download Olist dataset from Kaggle:")
        print("  https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce")
        return

    data = {}
    for f in csv_files:
        key = f.stem
        data[key] = pd.read_csv(f, low_memory=False)
        print(f"\n{key}:")
        print(f"  Shape: {data[key].shape}")
        print(f"  Columns: {list(data[key].columns)}")
        print(f"  Missing values:")
        missing = data[key].isnull().sum()
        missing = missing[missing > 0]
        if len(missing) > 0:
            for col, count in missing.items():
                print(f"    {col}: {count} ({count/len(data[key])*100:.1f}%)")
        else:
            print("    None")
        print(f"  Duplicates: {data[key].duplicated().sum()}")
        print(f"  Data types:")
        for col, dtype in data[key].dtypes.items():
            print(f"    {col}: {dtype}")

    fig, axes = plt.subplots(2, 3, figsize=(18, 10))

    if "olist_order_items_dataset" in data:
        items = data["olist_order_items_dataset"]
        axes[0, 0].hist(items["price"].dropna(), bins=50, color="steelblue", edgecolor="white")
        axes[0, 0].set_title("Price Distribution")
        axes[0, 0].set_xlabel("Price (BRL)")
        axes[0, 0].set_ylabel("Count")

        axes[0, 1].hist(items["freight_value"].dropna(), bins=50, color="coral", edgecolor="white")
        axes[0, 1].set_title("Freight Value Distribution")
        axes[0, 1].set_xlabel("Freight (BRL)")

    if "olist_orders_dataset" in data:
        orders = data["olist_orders_dataset"]
        status_counts = orders["order_status"].value_counts()
        axes[0, 2].barh(status_counts.index, status_counts.values, color="teal")
        axes[0, 2].set_title("Order Status Distribution")

    if "olist_order_payments_dataset" in data:
        pay = data["olist_order_payments_dataset"]
        pay_counts = pay["payment_type"].value_counts()
        axes[1, 0].bar(pay_counts.index, pay_counts.values, color="mediumpurple")
        axes[1, 0].set_title("Payment Method Distribution")
        axes[1, 0].tick_params(axis="x", rotation=45)

    if "olist_order_reviews_dataset" in data:
        rev = data["olist_order_reviews_dataset"]
        rev_counts = rev["review_score"].value_counts().sort_index()
        axes[1, 1].bar(rev_counts.index.astype(str), rev_counts.values, color="goldenrod")
        axes[1, 1].set_title("Review Score Distribution")

    if "olist_order_payments_dataset" in data:
        pay = data["olist_order_payments_dataset"]
        axes[1, 2].hist(pay["payment_value"].dropna(), bins=50, color="indianred", edgecolor="white")
        axes[1, 2].set_title("Payment Value Distribution")
        axes[1, 2].set_xlabel("Value (BRL)")

    plt.tight_layout()
    plt.savefig(SCREENSHOTS_DIR / "eda_overview.png", dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\nSaved: {SCREENSHOTS_DIR / 'eda_overview.png'}")

    if "olist_orders_dataset" in data and "olist_order_items_dataset" in data:
        orders = data["olist_orders_dataset"]
        items = data["olist_order_items_dataset"]
        orders["order_purchase_timestamp"] = pd.to_datetime(orders["order_purchase_timestamp"], errors="coerce")
        monthly = orders.set_index("order_purchase_timestamp").resample("M")["order_id"].nunique()
        plt.figure(figsize=(14, 5))
        monthly.plot(color="steelblue")
        plt.title("Monthly Orders Trend")
        plt.xlabel("Month")
        plt.ylabel("Orders")
        plt.tight_layout()
        plt.savefig(SCREENSHOTS_DIR / "eda_monthly_orders.png", dpi=150, bbox_inches="tight")
        plt.close()
        print(f"Saved: {SCREENSHOTS_DIR / 'eda_monthly_orders.png'}")

    print("\nEDA complete!")


if __name__ == "__main__":
    run_eda()
