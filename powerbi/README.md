# Power BI Setup Guide

## Overview

This directory contains everything needed to create a Power BI dashboard using the cleaned analytical data from the Python pipeline.

## Files

- `data_dictionary.md` - Complete data dictionary for all tables
- `relationships.md` - Star schema relationships
- `dax_measures.md` - Complete DAX measures
- `dashboard_specification.md` - Exact dashboard layout and visuals

## Setup Instructions

### Step 1: Run the Python Pipeline

```bash
cd python
pip install -r requirements.txt
python data_cleaning.py
python analytics.py
```

This generates cleaned CSV files in `data/processed/`.

### Step 2: Open Power BI Desktop

1. Open Power BI Desktop
2. Click "Get Data" > "Text/CSV"
3. Import the following files from `data/processed/`:

### Step 3: Import Tables

Import these files as tables:

| File | Table Name |
|------|------------|
| `factorders_clean.csv` | FactOrders |
| `factorderitems_clean.csv` | FactOrderItems |
| `factpayments_clean.csv` | FactPayments |
| `factreviews_clean.csv` | FactReviews |
| `dimcustomer.csv` | DimCustomer |
| `dimproduct.csv` | DimProduct |
| `dimseller.csv` | DimSeller |
| `dimdate.csv` | DimDate |
| `dimgeography.csv` | DimGeography |
| `dimpayment.csv` | DimPayment |
| `monthly_sales.csv` | MonthlySales |
| `category_sales.csv` | CategorySales |
| `state_sales.csv` | StateSales |
| `customer_metrics.csv` | CustomerMetrics |

### Step 4: Create Relationships

Follow the relationships defined in `relationships.md`.

### Step 5: Create DAX Measures

Copy all measures from `dax_measures.md` into Power BI.

### Step 6: Build Dashboard

Follow `dashboard_specification.md` for exact layout.
