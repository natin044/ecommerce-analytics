"""
E-Commerce Analytics Module
Calculates business metrics from cleaned analytical data.
"""

import pandas as pd
import numpy as np
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def load_processed():
    data = {}
    for f in PROCESSED_DIR.glob("*.csv"):
        key = f.stem
        data[key] = pd.read_csv(f, low_memory=False)
    return data


def calculate_kpis(data):
    kpis = {}
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    if orders.empty:
        return kpis

    kpis["total_revenue"] = float(orders["total_price"].sum()) if "total_price" in orders.columns else 0
    kpis["total_freight"] = float(orders["total_freight"].sum()) if "total_freight" in orders.columns else 0
    kpis["gross_sales"] = float(orders["total_item_revenue"].sum()) if "total_item_revenue" in orders.columns else 0
    kpis["total_orders"] = int(orders["order_id"].nunique())
    kpis["total_customers"] = int(orders["customer_id"].nunique()) if "customer_id" in orders.columns else 0
    kpis["avg_order_value"] = float(kpis["total_revenue"] / kpis["total_orders"]) if kpis["total_orders"] > 0 else 0
    kpis["avg_review_score"] = float(orders["review_score"].mean()) if "review_score" in orders.columns else 0
    kpis["avg_delivery_days"] = float(orders["delivery_days"].mean()) if "delivery_days" in orders.columns else 0
    kpis["late_delivery_rate"] = float(orders["is_late"].mean()) if "is_late" in orders.columns else 0
    cancelled = (orders["order_status"] == "canceled").sum() if "order_status" in orders.columns else 0
    kpis["cancellation_rate"] = float(cancelled / kpis["total_orders"]) if kpis["total_orders"] > 0 else 0

    return kpis


def monthly_sales(data):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    if orders.empty or "order_purchase_timestamp" not in orders.columns:
        return pd.DataFrame()
    df = orders.copy()
    df["order_purchase_timestamp"] = pd.to_datetime(df["order_purchase_timestamp"], errors="coerce")
    df = df.dropna(subset=["order_purchase_timestamp"])
    df["year_month"] = df["order_purchase_timestamp"].dt.to_period("M")
    monthly = df.groupby("year_month").agg(
        revenue=("total_price", "sum") if "total_price" in df.columns else ("order_id", "count"),
        orders=("order_id", "nunique"),
        customers=("customer_id", "nunique") if "customer_id" in df.columns else ("order_id", "count"),
        avg_order_value=("total_price", "mean") if "total_price" in df.columns else ("order_id", "count"),
        avg_review=("review_score", "mean") if "review_score" in df.columns else ("order_id", "count"),
    ).reset_index()
    monthly["year_month"] = monthly["year_month"].astype(str)
    return monthly


def category_sales(data):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    products = data.get("dimproduct", pd.DataFrame())
    if orders.empty or products.empty:
        return pd.DataFrame()
    if "product_id" not in orders.columns and "product_id" in products.columns:
        items = data.get("factorderitems_clean", pd.DataFrame())
        if not items.empty:
            orders = orders.merge(items[["order_id", "product_id"]], on="order_id", how="left")
    if "product_id" in orders.columns and "product_id" in products.columns:
        cat_col = "product_category_name_english" if "product_category_name_english" in products.columns else "product_category_name"
        orders = orders.merge(products[["product_id", cat_col]], on="product_id", how="left")
        cat_sales = orders.groupby(cat_col).agg(
            revenue=("total_price", "sum") if "total_price" in orders.columns else ("order_id", "count"),
            orders=("order_id", "nunique"),
        ).reset_index()
        cat_sales.columns = ["category", "revenue", "orders"]
        cat_sales = cat_sales.sort_values("revenue", ascending=False)
        return cat_sales
    return pd.DataFrame()


def state_sales(data):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    customers = data.get("dimcustomer", pd.DataFrame())
    if orders.empty or customers.empty:
        return pd.DataFrame()
    if "customer_id" in orders.columns and "customer_id" in customers.columns:
        merged = orders.merge(customers[["customer_id", "customer_state"]], on="customer_id", how="left")
        state = merged.groupby("customer_state").agg(
            revenue=("total_price", "sum") if "total_price" in merged.columns else ("order_id", "count"),
            orders=("order_id", "nunique"),
            customers=("customer_id", "nunique") if "customer_id" in merged.columns else ("order_id", "count"),
        ).reset_index()
        state.columns = ["state", "revenue", "orders", "customers"]
        return state.sort_values("revenue", ascending=False)
    return pd.DataFrame()


def top_products(data, n=10):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    products = data.get("dimproduct", pd.DataFrame())
    items = data.get("factorderitems_clean", pd.DataFrame())
    if orders.empty:
        return pd.DataFrame()
    if not items.empty and "product_id" in items.columns:
        merged = orders.merge(items[["order_id", "product_id", "price", "freight_value", "item_revenue"]],
                              on="order_id", how="left")
    elif "product_id" in orders.columns:
        merged = orders
    else:
        return pd.DataFrame()
    if not products.empty and "product_id" in products.columns:
        cat_col = "product_category_name_english" if "product_category_name_english" in products.columns else "product_category_name"
        merged = merged.merge(products[["product_id", cat_col]], on="product_id", how="left")
    agg = merged.groupby("product_id").agg(
        revenue=("item_revenue", "sum") if "item_revenue" in merged.columns else ("price", "sum") if "price" in merged.columns else ("order_id", "count"),
        quantity=("order_id", "count"),
        avg_price=("price", "mean") if "price" in merged.columns else ("order_id", "count"),
    ).reset_index()
    if not products.empty and "product_id" in products.columns:
        name_col = "product_category_name_english" if "product_category_name_english" in products.columns else "product_category_name"
        if name_col in products.columns:
            agg = agg.merge(products[["product_id", name_col]], on="product_id", how="left")
            agg["product_name"] = agg[name_col]
        else:
            agg["product_name"] = agg["product_id"]
    else:
        agg["product_name"] = agg["product_id"]
    return agg.sort_values("revenue", ascending=False).head(n)


def top_sellers(data, n=10):
    items = data.get("factorderitems_clean", pd.DataFrame())
    sellers = data.get("dimseller", pd.DataFrame())
    if items.empty:
        return pd.DataFrame()
    if "seller_id" in items.columns:
        agg = items.groupby("seller_id").agg(
            revenue=("item_revenue", "sum") if "item_revenue" in items.columns else ("price", "sum"),
            orders=("order_id", "nunique"),
            items_sold=("order_item_id", "count"),
        ).reset_index()
        if not sellers.empty and "seller_id" in sellers.columns:
            geo_cols = [c for c in ["seller_city", "seller_state"] if c in sellers.columns]
            if geo_cols:
                agg = agg.merge(sellers[["seller_id"] + geo_cols], on="seller_id", how="left")
        return agg.sort_values("revenue", ascending=False).head(n)
    return pd.DataFrame()


def customer_metrics(data):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    if orders.empty or "customer_id" not in orders.columns:
        return pd.DataFrame()
    cust = orders.groupby("customer_id").agg(
        orders=("order_id", "nunique"),
        total_spent=("total_price", "sum") if "total_price" in orders.columns else ("order_id", "count"),
        avg_order_value=("total_price", "mean") if "total_price" in orders.columns else ("order_id", "count"),
        first_order=("order_purchase_timestamp", "min"),
        last_order=("order_purchase_timestamp", "max"),
        avg_review=("review_score", "mean") if "review_score" in orders.columns else ("order_id", "count"),
    ).reset_index()
    cust["is_repeat"] = cust["orders"] > 1
    return cust


def delivery_metrics(data):
    orders = data.get("orders_full", data.get("factorders_clean", pd.DataFrame()))
    if orders.empty:
        return pd.DataFrame()
    valid = orders.dropna(subset=["delivery_days"])
    if valid.empty:
        return pd.DataFrame()
    status = orders.groupby("order_status").agg(
        count=("order_id", "count"),
    ).reset_index()
    return status


def payment_analysis(data):
    payments = data.get("factpayments_clean", pd.DataFrame())
    if payments.empty:
        return pd.DataFrame()
    agg = payments.groupby("payment_type").agg(
        count=("order_id", "count"),
        total_value=("payment_value", "sum"),
        avg_value=("payment_value", "mean"),
        avg_installments=("payment_installments", "mean"),
    ).reset_index()
    return agg.sort_values("count", ascending=False)


def review_analysis(data):
    reviews = data.get("factreviews_clean", pd.DataFrame())
    if reviews.empty:
        return pd.DataFrame()
    dist = reviews.groupby("review_score").agg(
        count=("order_id", "count"),
    ).reset_index()
    return dist


def freight_analysis(data):
    items = data.get("factorderitems_clean", pd.DataFrame())
    if items.empty:
        return pd.DataFrame()
    agg = items.agg(
        total_freight=("freight_value", "sum"),
        avg_freight=("freight_value", "mean"),
        max_freight=("freight_value", "max"),
        min_freight=("freight_value", "min"),
        total_revenue=("price", "sum"),
    ).reset_index()
    return agg


def run_analytics():
    print("Loading processed data...")
    data = load_processed()
    print(f"Loaded {len(data)} files")

    kpis = calculate_kpis(data)
    print("\nKPIs:")
    for k, v in kpis.items():
        print(f"  {k}: {v:.2f}" if isinstance(v, float) else f"  {k}: {v}")

    monthly = monthly_sales(data)
    cat = category_sales(data)
    state = state_sales(data)
    top_prod = top_products(data)
    top_sell = top_sellers(data)
    cust_met = customer_metrics(data)
    delivery = delivery_metrics(data)
    payments = payment_analysis(data)
    reviews = review_analysis(data)

    analytics_data = {
        "monthly_sales": monthly,
        "category_sales": cat,
        "state_sales": state,
        "top_products": top_prod,
        "top_sellers": top_sell,
        "customer_metrics": cust_met,
        "delivery_metrics": delivery,
        "payment_analysis": payments,
        "review_analysis": reviews,
    }

    from export_data import export_analytics
    export_analytics(analytics_data)

    return analytics_data


if __name__ == "__main__":
    run_analytics()
