"""
E-Commerce Data Cleaning Pipeline
Loads raw Olist CSVs, validates, cleans, and produces analytical tables.
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

REQUIRED_FILES = {
    "customers": "olist_customers_dataset.csv",
    "orders": "olist_orders_dataset.csv",
    "order_items": "olist_order_items_dataset.csv",
    "payments": "olist_order_payments_dataset.csv",
    "reviews": "olist_order_reviews_dataset.csv",
    "products": "olist_products_dataset.csv",
    "sellers": "olist_sellers_dataset.csv",
    "geolocation": "olist_geolocation_dataset.csv",
    "category_translation": "product_category_name_translation.csv",
}

timestamp_cols = {
    "orders": [
        "order_purchase_timestamp", "order_approved_at",
        "order_delivered_carrier_date", "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ],
    "reviews": ["review_creation_date", "review_answer_timestamp"],
}


def load_data():
    loaded = {}
    missing = []
    report = {}
    for key, fname in REQUIRED_FILES.items():
        fpath = RAW_DIR / fname
        if fpath.exists():
            try:
                df = pd.read_csv(fpath, low_memory=False)
                loaded[key] = df
                report[key] = {
                    "status": "loaded",
                    "rows": len(df),
                    "columns": list(df.columns),
                }
            except Exception as e:
                missing.append({"file": fname, "reason": f"Corrupt: {e}"})
                report[key] = {"status": "error", "reason": str(e)}
        else:
            missing.append({"file": fname, "reason": "File not found"})
            report[key] = {"status": "missing"}
    return loaded, missing, report


def validate_data(data):
    issues = []
    for key, df in data.items():
        dup_count = df.duplicated().sum()
        if dup_count > 0:
            issues.append(f"{key}: {dup_count} duplicate rows")
        for col in df.columns:
            null_pct = df[col].isnull().mean() * 100
            if null_pct > 0:
                issues.append(f"{key}.{col}: {null_pct:.1f}% missing")
    return issues


def clean_customers(df):
    df = df.drop_duplicates()
    if "customer_unique_id" in df.columns:
        df["customer_unique_id"] = df["customer_unique_id"].str.strip()
    if "customer_city" in df.columns:
        df["customer_city"] = df["customer_city"].str.strip().str.lower()
    if "customer_state" in df.columns:
        df["customer_state"] = df["customer_state"].str.strip().str.upper()
    return df


def clean_orders(df):
    df = df.drop_duplicates()
    for col in timestamp_cols.get("orders", []):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    if "order_status" in df.columns:
        df["order_status"] = df["order_status"].str.strip().str.lower()
    return df


def clean_order_items(df):
    df = df.drop_duplicates()
    for col in ["price", "freight_value"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].clip(lower=0)
    return df


def clean_products(df):
    df = df.drop_duplicates()
    for col in ["product_name_lenght", "product_description_lenght",
                 "product_photos_qty", "product_weight_g",
                 "product_length_cm", "product_height_cm", "product_width_cm"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "product_category_name" in df.columns:
        df["product_category_name"] = df["product_category_name"].fillna("unknown")
        df["product_category_name"] = df["product_category_name"].str.strip().str.lower()
    return df


def clean_payments(df):
    df = df.drop_duplicates()
    for col in ["payment_installments", "payment_value"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "payment_installments" in df.columns:
        df["payment_installments"] = df["payment_installments"].clip(lower=1)
    if "payment_value" in df.columns:
        df["payment_value"] = df["payment_value"].clip(lower=0)
    return df


def clean_reviews(df):
    df = df.drop_duplicates()
    for col in timestamp_cols.get("reviews", []):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    if "review_score" in df.columns:
        df["review_score"] = pd.to_numeric(df["review_score"], errors="coerce")
        df["review_score"] = df["review_score"].clip(lower=1, upper=5)
    for col in ["review_comment_title", "review_comment_message"]:
        if col in df.columns:
            df[col] = df[col].fillna("")
    return df


def create_dimensions(data):
    dims = {}
    if "customers" in data:
        dims["DimCustomer"] = data["customers"][
            ["customer_id", "customer_unique_id", "customer_city",
             "customer_state", "customer_zip_code_prefix"]
        ].drop_duplicates().reset_index(drop=True)

    if "products" in data and "category_translation" in data:
        prod = data["products"].copy()
        trans = data["category_translation"].copy()
        if "product_category_name" in trans.columns and "product_category_name_english" in trans.columns:
            prod = prod.merge(trans, on="product_category_name", how="left")
            prod["product_category_name_english"] = prod["product_category_name_english"].fillna(prod["product_category_name"])
        dims["DimProduct"] = prod.drop_duplicates().reset_index(drop=True)
    elif "products" in data:
        dims["DimProduct"] = data["products"].drop_duplicates().reset_index(drop=True)

    if "sellers" in data:
        dims["DimSeller"] = data["sellers"].drop_duplicates().reset_index(drop=True)

    if "orders" in data:
        orders = data["orders"]
        date_cols = ["order_purchase_timestamp", "order_approved_at",
                     "order_delivered_carrier_date", "order_delivered_customer_date",
                     "order_estimated_delivery_date"]
        dates = orders[date_cols].melt(var_name="event", value_name="date_val").dropna(subset=["date_val"])
        dates["date_val"] = pd.to_datetime(dates["date_val"], errors="coerce")
        dates = dates.dropna(subset=["date_val"])
        date_df = dates["date_val"].dt.date.drop_duplicates().reset_index(drop=True)
        date_df = pd.DataFrame({"date": date_df})
        date_df["date"] = pd.to_datetime(date_df["date"])
        date_df["year"] = date_df["date"].dt.year
        date_df["month"] = date_df["date"].dt.month
        date_df["day"] = date_df["date"].dt.day
        date_df["quarter"] = date_df["date"].dt.quarter
        date_df["day_of_week"] = date_df["date"].dt.day_name()
        date_df["month_name"] = date_df["date"].dt.month_name()
        date_df["week_of_year"] = date_df["date"].dt.isocalendar().week.astype(int)
        date_df["date_key"] = date_df["date"].dt.strftime("%Y%m%d").astype(int)
        dims["DimDate"] = date_df

    if "geolocation" in data:
        geo = data["geolocation"].copy()
        geo_cols = ["geolocation_zip_code_prefix", "geolocation_lat",
                     "geolocation_lng", "geolocation_city", "geolocation_state"]
        existing = [c for c in geo_cols if c in geo.columns]
        dims["DimGeography"] = geo[existing].drop_duplicates().reset_index(drop=True)

    if "payments" in data:
        pay = data["payments"][["payment_type"]].drop_duplicates().reset_index(drop=True)
        dims["DimPayment"] = pay

    return dims


def create_fact_tables(data, dims):
    facts = {}

    if "orders" in data:
        orders = data["orders"].copy()
        fact = orders[[
            "order_id", "customer_id", "order_status",
            "order_purchase_timestamp", "order_approved_at",
            "order_delivered_carrier_date", "order_delivered_customer_date",
            "order_estimated_delivery_date",
        ]].copy()

        for col in ["order_purchase_timestamp", "order_approved_at",
                     "order_delivered_carrier_date", "order_delivered_customer_date",
                     "order_estimated_delivery_date"]:
            fact[col] = pd.to_datetime(fact[col], errors="coerce")

        fact["delivery_days"] = (fact["order_delivered_customer_date"] - fact["order_purchase_timestamp"]).dt.days
        fact["estimated_delivery_days"] = (fact["order_estimated_delivery_date"] - fact["order_purchase_timestamp"]).dt.days
        fact["is_late"] = (
            (fact["order_delivered_customer_date"].notna()) &
            (fact["order_estimated_delivery_date"].notna()) &
            (fact["order_delivered_customer_date"] > fact["order_estimated_delivery_date"])
        ).astype(int)
        fact["purchase_date"] = fact["order_purchase_timestamp"].dt.date

        facts["FactOrders"] = fact

    if "order_items" in data:
        items = data["order_items"].copy()
        items["item_revenue"] = items["price"] + items["freight_value"]
        facts["FactOrderItems"] = items

    if "payments" in data:
        facts["FactPayments"] = data["payments"].copy()

    if "reviews" in data:
        reviews = data["reviews"][[
            "order_id", "review_score", "review_comment_title",
            "review_comment_message",
        ]].copy()
        facts["FactReviews"] = reviews

    return facts


def create_analytical_dataset(facts, dims):
    analytical = {}

    if "FactOrders" in facts and "FactOrderItems" in facts:
        oi = facts["FactOrderItems"].copy()
        items_agg = oi.groupby("order_id").agg(
            total_item_revenue=("item_revenue", "sum"),
            total_price=("price", "sum"),
            total_freight=("freight_value", "sum"),
            item_count=("order_item_id", "count"),
        ).reset_index()
        analytical["order_items_agg"] = items_agg

    if "FactOrders" in facts:
        orders = facts["FactOrders"].copy()
        if "order_items_agg" in analytical:
            orders = orders.merge(analytical["order_items_agg"], on="order_id", how="left")
        if "FactPayments" in facts:
            pay_agg = facts["FactPayments"].groupby("order_id").agg(
                payment_value_total=("payment_value", "sum"),
                payment_types=("payment_type", lambda x: ",".join(x.unique())),
                payment_installments_max=("payment_installments", "max"),
            ).reset_index()
            orders = orders.merge(pay_agg, on="order_id", how="left")
        if "FactReviews" in facts:
            rev_agg = facts["FactReviews"].groupby("order_id").agg(
                review_score=("review_score", "mean"),
                review_count=("review_score", "count"),
            ).reset_index()
            orders = orders.merge(rev_agg, on="order_id", how="left")
        analytical["orders_full"] = orders

    if "FactOrders" in facts and "DimCustomer" in dims:
        cust_orders = facts["FactOrders"].merge(dims["DimCustomer"], on="customer_id", how="left")
        analytical["customer_orders"] = cust_orders

    return analytical


def generate_quality_report(data, cleaning_log):
    report = {}
    for key, df in data.items():
        report[key] = {
            "rows": len(df),
            "columns": len(df.columns),
            "missing_values": {col: int(df[col].isnull().sum()) for col in df.columns if df[col].isnull().sum() > 0},
            "duplicate_count": int(df.duplicated().sum()),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        }
    report["cleaning_actions"] = cleaning_log
    return report


def export_processed_data(facts, dims, analytical):
    for name, df in facts.items():
        df.to_csv(PROCESSED_DIR / f"{name.lower()}_clean.csv", index=False)
    for name, df in dims.items():
        df.to_csv(PROCESSED_DIR / f"{name.lower()}.csv", index=False)
    for name, df in analytical.items():
        df.to_csv(PROCESSED_DIR / f"{name}.csv", index=False)


def export_analytics(analytics_data):
    for name, df in analytics_data.items():
        if isinstance(df, pd.DataFrame):
            df.to_csv(PROCESSED_DIR / f"{name}.csv", index=False)


def run_pipeline():
    print("=" * 60)
    print("E-Commerce Data Cleaning Pipeline")
    print("=" * 60)

    print("\n[1/8] Loading data...")
    data, missing_files, load_report = load_data()

    if missing_files:
        print("\n  MISSING FILES:")
        for m in missing_files:
            print(f"    - {m['file']}: {m['reason']}")

    if not data:
        print("\n  No data files found. Please place Olist CSVs in data/raw/")
        print("  Required files:")
        for key, fname in REQUIRED_FILES.items():
            print(f"    - {fname}")
        return None, None, None, None, load_report

    print(f"\n  Loaded {len(data)} datasets")

    print("\n[2/8] Validating data...")
    issues = validate_data(data)
    for issue in issues:
        print(f"  - {issue}")

    cleaning_log = []

    print("\n[3/8] Cleaning customers...")
    if "customers" in data:
        before = len(data["customers"])
        data["customers"] = clean_customers(data["customers"])
        after = len(data["customers"])
        cleaning_log.append(f"customers: removed {before - after} duplicates")

    print("\n[4/8] Cleaning orders...")
    if "orders" in data:
        before = len(data["orders"])
        data["orders"] = clean_orders(data["orders"])
        after = len(data["orders"])
        cleaning_log.append(f"orders: removed {before - after} duplicates")

    print("\n[5/8] Cleaning order items, products, payments, reviews...")
    for key, clean_fn in [("order_items", clean_order_items),
                           ("products", clean_products),
                           ("payments", clean_payments),
                           ("reviews", clean_reviews)]:
        if key in data:
            before = len(data[key])
            data[key] = clean_fn(data[key])
            after = len(data[key])
            cleaning_log.append(f"{key}: removed {before - after} duplicates")

    print("\n[6/8] Creating dimensions...")
    dims = create_dimensions(data)
    for name, df in dims.items():
        print(f"  {name}: {len(df)} rows")

    print("\n[7/8] Creating fact tables...")
    facts = create_fact_tables(data, dims)
    for name, df in facts.items():
        print(f"  {name}: {len(df)} rows")

    print("\n[8/8] Creating analytical dataset...")
    analytical = create_analytical_dataset(facts, dims)
    for name, df in analytical.items():
        if isinstance(df, pd.DataFrame):
            print(f"  {name}: {len(df)} rows")

    quality_report = generate_quality_report(data, cleaning_log)
    with open(PROCESSED_DIR / "data_quality_report.json", "w") as f:
        json.dump(quality_report, f, indent=2, default=str)

    export_processed_data(facts, dims, analytical)

    print("\n" + "=" * 60)
    print("Pipeline complete!")
    print(f"Processed files saved to: {PROCESSED_DIR}")
    print("=" * 60)

    return data, facts, dims, analytical, load_report


if __name__ == "__main__":
    run_pipeline()
