# E-Commerce Sales & Customer Analytics Platform

An end-to-end analytics system built on the Olist Brazilian E-Commerce dataset. Processes real CSV data, performs data cleaning and transformation, calculates business metrics, exposes results through a web application, and prepares a star schema for Power BI.

## Architecture

```
RAW OLIST CSVs
    ↓
Data Validation
    ↓
Python/Pandas Cleaning
    ↓
Data Transformation
    ↓
Analytical Data Model
    ↓
┌───────────────────┬────────────────────┐
│                   │                    │
↓                   ↓                    ↓
SQL Analysis    React Web App       Power BI
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Recharts, Lucide React |
| Backend | Python, FastAPI, Pandas, NumPy |
| Analytics | Python/Pandas, SQL, DAX (Power BI) |
| Data | Olist Brazilian E-Commerce CSVs |

## Dataset

The project uses the Olist Brazilian E-Commerce dataset from Kaggle:
https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

### Required Files

Place these CSV files in `data/raw/`:

- `olist_customers_dataset.csv`
- `olist_orders_dataset.csv`
- `olist_order_items_dataset.csv`
- `olist_order_payments_dataset.csv`
- `olist_order_reviews_dataset.csv`
- `olist_products_dataset.csv`
- `olist_sellers_dataset.csv`
- `olist_geolocation_dataset.csv`
- `product_category_name_translation.csv`

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1. Install Python Dependencies

```bash
cd python
pip install -r requirements.txt
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

### Step 1: Run Python Pipeline

```bash
cd python
python data_cleaning.py
python analytics.py
```

This processes raw CSVs and generates cleaned analytical data in `data/processed/`.

### Step 2: Start Backend

```bash
cd backend
python main.py
```

API runs at `http://localhost:8000`.

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`.

## Project Structure

```
ecommerce-analytics/
├── frontend/              # React TypeScript app
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       └── lib/           # API client, utilities
├── backend/               # FastAPI server
│   └── main.py
├── python/                # Data pipeline
│   ├── data_cleaning.py
│   ├── analytics.py
│   ├── eda.py
│   └── export_data.py
├── sql/                   # SQL schema and queries
│   ├── schema.sql
│   └── analysis_queries.sql
├── data/
│   ├── raw/               # Place Olist CSVs here
│   └── processed/         # Generated cleaned data
├── powerbi/               # Power BI documentation
│   ├── README.md
│   ├── data_dictionary.md
│   ├── relationships.md
│   ├── dax_measures.md
│   └── dashboard_specification.md
├── docs/
│   └── metric_definitions.md
└── README.md
```

## Business Metrics

All metrics use consistent definitions across SQL, Python, and Power BI:

| Metric | Definition |
|--------|-----------|
| Total Revenue | SUM(order_items.price) |
| Total Freight | SUM(order_items.freight_value) |
| Gross Sales | SUM(price + freight_value) |
| Total Orders | DISTINCTCOUNT(order_id) |
| Total Customers | DISTINCTCOUNT(customer_id) |
| AOV | Total Revenue / Total Orders |
| Avg Review | AVERAGE(review_score) |
| Delivery Days | delivered_date - purchase_date |
| Late Rate | late orders / delivered orders |
| Cancel Rate | cancelled / total orders |

## Web Application Pages

- **Dashboard** - Executive KPIs and key charts
- **Sales Analytics** - Revenue trends, categories, states, products, sellers
- **Customer Analytics** - Customer metrics, segmentation, top customers
- **Product Analytics** - Categories, products, search
- **Orders & Delivery** - Status distribution, delivery performance, late rates
- **Data Quality** - Data completeness, missing values, cleaning report
- **Business Insights** - Automated insight generation from actual data

## Power BI Setup

See `powerbi/README.md` for complete setup instructions.

The Power BI model uses a star schema with:
- 6 dimension tables (Date, Customer, Product, Seller, Geography, Payment)
- 4 fact tables (Orders, OrderItems, Payments, Reviews)
- Complete DAX measure library

## Data Quality

The pipeline handles:
- Missing values (imputation vs removal based on context)
- Duplicate rows
- Invalid data types
- Timestamp conversion
- Referential integrity
- Invalid numerical values

A data quality report is generated at `data/processed/data_quality_report.json`.

## Future Improvements

- Real-time data updates
- User authentication
- Database storage (MySQL/PostgreSQL)
- Predictive analytics
- A/B testing framework
- Export to PDF/Excel
- Mobile-responsive design
