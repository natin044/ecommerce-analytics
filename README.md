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

