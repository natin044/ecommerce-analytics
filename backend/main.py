"""
FastAPI Backend for E-Commerce Analytics
Serves cleaned analytical data as JSON API endpoints.
"""

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional, List
import json

app = FastAPI(title="E-Commerce Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

_cache = {}


def load_csv(name: str) -> pd.DataFrame:
    if name not in _cache:
        fpath = PROCESSED_DIR / f"{name}.csv"
        if fpath.exists():
            _cache[name] = pd.read_csv(fpath, low_memory=False)
        else:
            return pd.DataFrame()
    return _cache[name]


def refresh_cache():
    _cache.clear()
    for f in PROCESSED_DIR.glob("*.csv"):
        key = f.stem
        try:
            _cache[key] = pd.read_csv(f, low_memory=False)
        except Exception:
            pass


def safe_float(v):
    if pd.isna(v):
        return 0.0
    return float(v)


def safe_int(v):
    if pd.isna(v):
        return 0
    return int(v)


def df_to_records(df: pd.DataFrame, limit: int = 10000):
    df = df.head(limit)
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    return df.to_dict(orient="records")


def apply_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    if not filters:
        return df

    if "state" in filters and filters["state"] and "customer_state" in df.columns:
        df = df[df["customer_state"].isin(filters["state"])]

    if "category" in filters and filters["category"] and "category" in df.columns:
        df = df[df["category"].isin(filters["category"])]

    if "order_status" in filters and filters["order_status"] and "order_status" in df.columns:
        df = df[df["order_status"].isin(filters["order_status"])]

    if "payment_type" in filters and filters["payment_type"] and "payment_type" in df.columns:
        df = df[df["payment_type"].isin(filters["payment_type"])]

    if "date_from" in filters and filters["date_from"] and "order_purchase_timestamp" in df.columns:
        df = df[pd.to_datetime(df["order_purchase_timestamp"], errors="coerce") >= filters["date_from"]]

    if "date_to" in filters and filters["date_to"] and "order_purchase_timestamp" in df.columns:
        df = df[pd.to_datetime(df["order_purchase_timestamp"], errors="coerce") <= filters["date_to"]]

    return df


@app.get("/api/health")
def health_check():
    files_available = list(PROCESSED_DIR.glob("*.csv"))
    return {
        "status": "ok",
        "processed_files": len(files_available),
        "files": [f.stem for f in files_available],
    }


@app.post("/api/refresh")
def refresh():
    refresh_cache()
    return {"status": "refreshed"}


@app.get("/api/kpis")
def get_kpis(
    state: Optional[str] = None,
    category: Optional[str] = None,
    order_status: Optional[str] = None,
    payment_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    orders = load_csv("orders_full")
    if orders.empty:
        orders = load_csv("factorders_clean")
    if orders.empty:
        return {"error": "No order data available"}

    state_list = state.split(",") if state else None
    cat_list = category.split(",") if category else None
    status_list = order_status.split(",") if order_status else None
    pay_list = payment_type.split(",") if payment_type else None

    filters = {
        "state": state_list,
        "category": cat_list,
        "order_status": status_list,
        "payment_type": pay_list,
        "date_from": date_from,
        "date_to": date_to,
    }
    orders = apply_filters(orders, filters)

    if orders.empty:
        return {
            "total_revenue": 0, "total_freight": 0, "gross_sales": 0,
            "total_orders": 0, "total_customers": 0, "avg_order_value": 0,
            "avg_review_score": 0, "avg_delivery_days": 0,
            "late_delivery_rate": 0, "cancellation_rate": 0,
        }

    total_revenue = safe_float(orders["total_price"].sum()) if "total_price" in orders.columns else 0
    total_freight = safe_float(orders["total_freight"].sum()) if "total_freight" in orders.columns else 0
    gross_sales = safe_float(orders["total_item_revenue"].sum()) if "total_item_revenue" in orders.columns else 0
    total_orders = int(orders["order_id"].nunique())
    total_customers = int(orders["customer_id"].nunique()) if "customer_id" in orders.columns else total_orders
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    avg_review = safe_float(orders["review_score"].mean()) if "review_score" in orders.columns else 0
    avg_delivery = safe_float(orders["delivery_days"].mean()) if "delivery_days" in orders.columns else 0
    late_rate = safe_float(orders["is_late"].mean()) if "is_late" in orders.columns else 0
    cancelled = (orders["order_status"] == "canceled").sum() if "order_status" in orders.columns else 0
    cancel_rate = cancelled / total_orders if total_orders > 0 else 0

    return {
        "total_revenue": round(total_revenue, 2),
        "total_freight": round(total_freight, 2),
        "gross_sales": round(gross_sales, 2),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "avg_order_value": round(avg_order_value, 2),
        "avg_review_score": round(avg_review, 2),
        "avg_delivery_days": round(avg_delivery, 2),
        "late_delivery_rate": round(late_rate, 4),
        "cancellation_rate": round(cancel_rate, 4),
    }


@app.get("/api/monthly-sales")
def get_monthly_sales():
    df = load_csv("monthly_sales")
    if df.empty:
        return {"data": [], "error": "No monthly sales data"}
    return {"data": df_to_records(df)}


@app.get("/api/category-sales")
def get_category_sales():
    df = load_csv("category_sales")
    if df.empty:
        return {"data": [], "error": "No category sales data"}
    return {"data": df_to_records(df)}


@app.get("/api/state-sales")
def get_state_sales():
    df = load_csv("state_sales")
    if df.empty:
        return {"data": [], "error": "No state sales data"}
    return {"data": df_to_records(df)}


@app.get("/api/top-products")
def get_top_products(n: int = Query(default=10, ge=1, le=100)):
    df = load_csv("top_products")
    if df.empty:
        return {"data": [], "error": "No product data"}
    return {"data": df_to_records(df.head(n))}


@app.get("/api/top-sellers")
def get_top_sellers(n: int = Query(default=10, ge=1, le=100)):
    df = load_csv("top_sellers")
    if df.empty:
        return {"data": [], "error": "No seller data"}
    return {"data": df_to_records(df.head(n))}


@app.get("/api/customers")
def get_customer_metrics():
    df = load_csv("customer_metrics")
    if df.empty:
        return {"data": [], "error": "No customer data"}
    return {"data": df_to_records(df)}


@app.get("/api/customer-summary")
def get_customer_summary():
    df = load_csv("customer_metrics")
    if df.empty:
        return {"error": "No customer data"}

    total = len(df)
    repeat = int((df["total_orders"] > 1).sum()) if "total_orders" in df.columns else 0
    one_time = total - repeat
    avg_spend = safe_float(df["total_spent"].mean()) if "total_spent" in df.columns else 0

    return {
        "total_customers": total,
        "repeat_customers": repeat,
        "one_time_customers": one_time,
        "repeat_rate": round(repeat / total * 100, 2) if total > 0 else 0,
        "avg_customer_spend": round(avg_spend, 2),
    }


@app.get("/api/delivery")
def get_delivery_analysis():
    orders = load_csv("orders_full")
    if orders.empty:
        orders = load_csv("factorders_clean")
    if orders.empty:
        return {"error": "No order data"}

    delivered = orders.dropna(subset=["delivery_days"]) if "delivery_days" in orders.columns else pd.DataFrame()

    status_dist = orders["order_status"].value_counts().to_dict() if "order_status" in orders.columns else {}

    result = {
        "status_distribution": status_dist,
        "total_delivered": len(delivered) if not delivered.empty else 0,
        "avg_delivery_days": round(safe_float(delivered["delivery_days"].mean()), 2) if not delivered.empty and "delivery_days" in delivered.columns else 0,
        "late_orders": safe_int(delivered["is_late"].sum()) if not delivered.empty and "is_late" in delivered.columns else 0,
        "late_rate": round(safe_float(delivered["is_late"].mean()), 4) if not delivered.empty and "is_late" in delivered.columns else 0,
    }

    if not delivered.empty and "order_purchase_timestamp" in delivered.columns:
        delivered = delivered.copy()
        delivered["order_purchase_timestamp"] = pd.to_datetime(delivered["order_purchase_timestamp"], errors="coerce")
        delivered["year_month"] = delivered["order_purchase_timestamp"].dt.to_period("M")
        monthly = delivered.groupby("year_month").agg(
            avg_days=("delivery_days", "mean"),
            late_rate=("is_late", "mean"),
            count=("order_id", "count"),
        ).reset_index()
        monthly["year_month"] = monthly["year_month"].astype(str)
        result["monthly_delivery"] = df_to_records(monthly)

    return result


@app.get("/api/payments")
def get_payment_analysis():
    df = load_csv("factpayments_clean")
    if df.empty:
        return {"data": [], "error": "No payment data"}

    agg = df.groupby("payment_type").agg(
        count=("order_id", "count"),
        total_value=("payment_value", "sum"),
        avg_value=("payment_value", "mean"),
        avg_installments=("payment_installments", "mean"),
    ).reset_index()
    agg = agg.replace({np.nan: None})
    return {"data": df_to_records(agg)}


@app.get("/api/reviews")
def get_review_analysis():
    df = load_csv("factreviews_clean")
    if df.empty:
        return {"data": [], "error": "No review data"}

    dist = df["review_score"].value_counts().sort_index().reset_index()
    dist.columns = ["score", "count"]
    avg_score = safe_float(df["review_score"].mean())
    return {
        "data": df_to_records(dist),
        "avg_score": round(avg_score, 2),
        "total_reviews": len(df),
    }


@app.get("/api/data-quality")
def get_data_quality():
    report_path = PROCESSED_DIR / "data_quality_report.json"
    if report_path.exists():
        with open(report_path) as f:
            report = json.load(f)
        return report
    return {"error": "No data quality report available"}


@app.get("/api/insights")
def get_insights():
    orders = load_csv("orders_full")
    if orders.empty:
        return {"insights": [], "error": "No data available"}

    insights = []

    total_revenue = safe_float(orders["total_price"].sum()) if "total_price" in orders.columns else 0
    total_orders = int(orders["order_id"].nunique())

    if "customer_id" in orders.columns:
        cust_orders = orders.groupby("customer_id")["order_id"].nunique()
        repeat_pct = safe_float((cust_orders > 1).mean() * 100)
        insights.append({
            "category": "Customers",
            "text": f"{repeat_pct:.1f}% of customers placed more than one order.",
        })

    if "total_price" in orders.columns and "total_item_revenue" in orders.columns:
        aov = total_revenue / total_orders if total_orders > 0 else 0
        insights.append({
            "category": "Sales",
            "text": f"Average order value is R${aov:.2f}.",
        })

    if "review_score" in orders.columns:
        avg_review = safe_float(orders["review_score"].mean())
        insights.append({
            "category": "Products",
            "text": f"Average review score is {avg_review:.2f} out of 5.",
        })

    if "is_late" in orders.columns:
        delivered = orders.dropna(subset=["delivery_days"])
        if not delivered.empty:
            late_pct = safe_float(delivered["is_late"].mean() * 100)
            insights.append({
                "category": "Delivery",
                "text": f"{late_pct:.1f}% of orders were delivered late.",
            })

    if "order_status" in orders.columns:
        cancelled = (orders["order_status"] == "canceled").sum()
        cancel_pct = cancelled / total_orders * 100 if total_orders > 0 else 0
        insights.append({
            "category": "Operations",
            "text": f"Cancellation rate is {cancel_pct:.2f}%.",
        })

    cat_sales = load_csv("category_sales")
    if not cat_sales.empty and "category" in cat_sales.columns and "revenue" in cat_sales.columns:
        total_cat_rev = cat_sales["revenue"].sum()
        if total_cat_rev > 0:
            top_cat = cat_sales.iloc[0]
            pct = safe_float(top_cat["revenue"] / total_cat_rev * 100)
            insights.append({
                "category": "Products",
                "text": f"Category '{top_cat['category']}' generated {pct:.1f}% of total revenue.",
            })

    state_sales = load_csv("state_sales")
    if not state_sales.empty and "state" in state_sales.columns and "revenue" in state_sales.columns:
        top_state = state_sales.iloc[0]
        insights.append({
            "category": "Sales",
            "text": f"State '{top_state['state']}' generated the highest revenue at R${safe_float(top_state['revenue']):.2f}.",
        })

    payments = load_csv("factpayments_clean")
    if not payments.empty and "payment_type" in payments.columns:
        most_common = payments["payment_type"].mode()
        if len(most_common) > 0:
            insights.append({
                "category": "Operations",
                "text": f"Payment method '{most_common.iloc[0]}' was the most frequently used.",
            })

    return {"insights": insights}


@app.get("/api/filters")
def get_filter_options():
    orders = load_csv("orders_full")
    customers = load_csv("dimcustomer")
    payments = load_csv("factpayments_clean")

    result = {
        "states": [],
        "categories": [],
        "order_statuses": [],
        "payment_types": [],
        "date_range": {"min": None, "max": None},
    }

    if not customers.empty and "customer_state" in customers.columns:
        result["states"] = sorted(customers["customer_state"].dropna().unique().tolist())

    cat_sales = load_csv("category_sales")
    if not cat_sales.empty and "category" in cat_sales.columns:
        result["categories"] = sorted(cat_sales["category"].dropna().unique().tolist())

    if not orders.empty and "order_status" in orders.columns:
        result["order_statuses"] = sorted(orders["order_status"].dropna().unique().tolist())

    if not payments.empty and "payment_type" in payments.columns:
        result["payment_types"] = sorted(payments["payment_type"].dropna().unique().tolist())

    if not orders.empty and "order_purchase_timestamp" in orders.columns:
        dates = pd.to_datetime(orders["order_purchase_timestamp"], errors="coerce").dropna()
        if not dates.empty:
            result["date_range"]["min"] = str(dates.min().date())
            result["date_range"]["max"] = str(dates.max().date())

    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
