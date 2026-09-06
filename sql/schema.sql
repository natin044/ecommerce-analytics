-- E-Commerce Analytics Star Schema
-- MySQL DDL

CREATE DATABASE IF NOT EXISTS ecommerce_analytics;
USE ecommerce_analytics;

-- Dimension Tables

CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE NOT NULL,
    year INT,
    month INT,
    day INT,
    quarter INT,
    day_of_week VARCHAR(10),
    month_name VARCHAR(10),
    week_of_year INT
);

CREATE TABLE dim_customer (
    customer_key INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    customer_unique_id VARCHAR(50),
    customer_city VARCHAR(100),
    customer_state VARCHAR(5),
    customer_zip_code_prefix VARCHAR(10),
    UNIQUE KEY uq_customer (customer_id)
);

CREATE TABLE dim_product (
    product_key INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_category_name VARCHAR(100),
    product_category_name_english VARCHAR(100),
    product_name_lenght FLOAT,
    product_description_lenght FLOAT,
    product_photos_qty FLOAT,
    product_weight_g FLOAT,
    product_length_cm FLOAT,
    product_height_cm FLOAT,
    product_width_cm FLOAT,
    UNIQUE KEY uq_product (product_id)
);

CREATE TABLE dim_seller (
    seller_key INT AUTO_INCREMENT PRIMARY KEY,
    seller_id VARCHAR(50) NOT NULL,
    seller_zip_code_prefix VARCHAR(10),
    seller_city VARCHAR(100),
    seller_state VARCHAR(5),
    UNIQUE KEY uq_seller (seller_id)
);

CREATE TABLE dim_geography (
    geo_key INT AUTO_INCREMENT PRIMARY KEY,
    zip_code_prefix VARCHAR(10),
    latitude FLOAT,
    longitude FLOAT,
    city VARCHAR(100),
    state VARCHAR(5)
);

CREATE TABLE dim_payment (
    payment_key INT AUTO_INCREMENT PRIMARY KEY,
    payment_type VARCHAR(30) NOT NULL,
    UNIQUE KEY uq_payment (payment_type)
);

-- Fact Tables

CREATE TABLE fact_orders (
    order_key INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    order_status VARCHAR(20),
    purchase_date DATE,
    approved_date DATETIME,
    delivered_carrier_date DATETIME,
    delivered_customer_date DATETIME,
    estimated_delivery_date DATETIME,
    delivery_days FLOAT,
    estimated_delivery_days FLOAT,
    is_late TINYINT DEFAULT 0,
    UNIQUE KEY uq_order (order_id)
);

CREATE TABLE fact_order_items (
    item_key INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    seller_id VARCHAR(50),
    order_item_id INT,
    price FLOAT,
    freight_value FLOAT,
    item_revenue FLOAT,
    KEY idx_order (order_id),
    KEY idx_product (product_id),
    KEY idx_seller (seller_id)
);

CREATE TABLE fact_payments (
    payment_record_key INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    payment_type VARCHAR(30),
    payment_installments INT,
    payment_value FLOAT,
    KEY idx_order (order_id)
);

CREATE TABLE fact_reviews (
    review_key INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    review_score FLOAT,
    review_comment_title TEXT,
    review_comment_message TEXT,
    KEY idx_order (order_id)
);

-- Aggregated analytical tables

CREATE TABLE monthly_sales (
    year_month VARCHAR(7) PRIMARY KEY,
    revenue FLOAT,
    total_orders INT,
    total_customers INT,
    avg_order_value FLOAT,
    avg_review_score FLOAT
);

CREATE TABLE category_sales (
    category VARCHAR(100) PRIMARY KEY,
    revenue FLOAT,
    total_orders INT
);

CREATE TABLE state_sales (
    state VARCHAR(5) PRIMARY KEY,
    revenue FLOAT,
    total_orders INT,
    total_customers INT
);

CREATE TABLE customer_metrics (
    customer_id VARCHAR(50) PRIMARY KEY,
    total_orders INT,
    total_spent FLOAT,
    avg_order_value FLOAT,
    first_order DATE,
    last_order DATE,
    avg_review FLOAT,
    is_repeat TINYINT
);
