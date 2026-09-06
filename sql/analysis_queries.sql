-- E-Commerce Analytics SQL Queries
USE ecommerce_analytics;

-- 1. Total Revenue
SELECT SUM(price) AS total_revenue
FROM fact_order_items;

-- 2. Total Orders
SELECT COUNT(DISTINCT order_id) AS total_orders
FROM fact_orders;

-- 3. Total Customers
SELECT COUNT(DISTINCT customer_unique_id) AS total_customers
FROM dim_customer;

-- 4. Average Order Value
SELECT SUM(foi.price) / COUNT(DISTINCT fo.order_id) AS avg_order_value
FROM fact_orders fo
JOIN fact_order_items foi ON fo.order_id = foi.order_id;

-- 5. Revenue by Month (Advanced with CTE)
WITH monthly AS (
    SELECT
        DATE_FORMAT(fo.purchase_date, '%Y-%m') AS year_month,
        SUM(foi.price) AS revenue,
        COUNT(DISTINCT fo.order_id) AS orders
    FROM fact_orders fo
    JOIN fact_order_items foi ON fo.order_id = foi.order_id
    GROUP BY year_month
)
SELECT
    year_month,
    revenue,
    orders,
    LAG(revenue) OVER (ORDER BY year_month) AS prev_month_revenue,
    ROUND((revenue - LAG(revenue) OVER (ORDER BY year_month)) / LAG(revenue) OVER (ORDER BY year_month) * 100, 2) AS growth_pct
FROM monthly
ORDER BY year_month;

-- 6. Revenue by Year
SELECT
    YEAR(fo.purchase_date) AS sale_year,
    SUM(foi.price) AS revenue,
    COUNT(DISTINCT fo.order_id) AS orders
FROM fact_orders fo
JOIN fact_order_items foi ON fo.order_id = foi.order_id
GROUP BY sale_year
ORDER BY sale_year;

-- 7. Revenue by Category
SELECT
    COALESCE(dp.product_category_name_english, dp.product_category_name, 'Unknown') AS category,
    SUM(foi.price) AS revenue,
    COUNT(DISTINCT foi.order_id) AS orders
FROM fact_order_items foi
LEFT JOIN dim_product dp ON foi.product_id = dp.product_id
GROUP BY category
ORDER BY revenue DESC;

-- 8. Revenue by State
SELECT
    dc.customer_state AS state,
    SUM(foi.price) AS revenue,
    COUNT(DISTINCT fo.order_id) AS orders,
    COUNT(DISTINCT dc.customer_id) AS customers
FROM fact_orders fo
JOIN fact_order_items foi ON fo.order_id = foi.order_id
JOIN dim_customer dc ON fo.customer_id = dc.customer_id
GROUP BY dc.customer_state
ORDER BY revenue DESC;

-- 9. Top 10 Products by Revenue
SELECT
    foi.product_id,
    COALESCE(dp.product_category_name_english, dp.product_category_name, 'Unknown') AS product_name,
    SUM(foi.price) AS revenue,
    COUNT(*) AS quantity_sold
FROM fact_order_items foi
LEFT JOIN dim_product dp ON foi.product_id = dp.product_id
GROUP BY foi.product_id, product_name
ORDER BY revenue DESC
LIMIT 10;

-- 10. Top 10 Sellers
SELECT
    foi.seller_id,
    ds.seller_state,
    SUM(foi.price) AS revenue,
    COUNT(DISTINCT foi.order_id) AS orders,
    COUNT(*) AS items_sold
FROM fact_order_items foi
LEFT JOIN dim_seller ds ON foi.seller_id = ds.seller_id
GROUP BY foi.seller_id, ds.seller_state
ORDER BY revenue DESC
LIMIT 10;

-- 11. Top Customers by Spend
SELECT
    dc.customer_id,
    dc.customer_unique_id,
    dc.customer_state,
    COUNT(DISTINCT fo.order_id) AS orders,
    SUM(foi.price) AS total_spent
FROM fact_orders fo
JOIN fact_order_items foi ON fo.order_id = foi.order_id
JOIN dim_customer dc ON fo.customer_id = dc.customer_id
GROUP BY dc.customer_id, dc.customer_unique_id, dc.customer_state
ORDER BY total_spent DESC
LIMIT 10;

-- 12. Orders by Status
SELECT
    order_status,
    COUNT(*) AS order_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fact_orders), 2) AS pct
FROM fact_orders
GROUP BY order_status
ORDER BY order_count DESC;

-- 13. Payment Method Distribution
SELECT
    payment_type,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fact_payments), 2) AS pct,
    AVG(payment_value) AS avg_value,
    AVG(payment_installments) AS avg_installments
FROM fact_payments
GROUP BY payment_type
ORDER BY count DESC;

-- 14. Average Review Score
SELECT
    AVG(review_score) AS avg_review_score,
    COUNT(*) AS total_reviews
FROM fact_reviews;

-- 15. Review Score Distribution
SELECT
    review_score,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fact_reviews), 2) AS pct
FROM fact_reviews
GROUP BY review_score
ORDER BY review_score;

-- 16. Delivery Performance (Simple)
SELECT
    order_status,
    COUNT(*) AS count,
    AVG(delivery_days) AS avg_delivery_days,
    MIN(delivery_days) AS min_delivery_days,
    MAX(delivery_days) AS max_delivery_days
FROM fact_orders
WHERE delivery_days IS NOT NULL
GROUP BY order_status;

-- 17. Late Delivery Rate
SELECT
    COUNT(*) AS total_delivered,
    SUM(is_late) AS late_orders,
    ROUND(SUM(is_late) * 100.0 / COUNT(*), 2) AS late_rate_pct
FROM fact_orders
WHERE delivered_customer_date IS NOT NULL;

-- 18. Late Delivery Rate by Month (Advanced)
WITH delivered AS (
    SELECT
        DATE_FORMAT(purchase_date, '%Y-%m') AS year_month,
        COUNT(*) AS total,
        SUM(is_late) AS late_count
    FROM fact_orders
    WHERE delivered_customer_date IS NOT NULL
    GROUP BY year_month
)
SELECT
    year_month,
    total,
    late_count,
    ROUND(late_count * 100.0 / total, 2) AS late_rate_pct
FROM delivered
ORDER BY year_month;

-- 19. Freight Analysis
SELECT
    SUM(freight_value) AS total_freight,
    AVG(freight_value) AS avg_freight,
    MAX(freight_value) AS max_freight,
    MIN(freight_value) AS min_freight,
    SUM(freight_value) / (SELECT SUM(price) FROM fact_order_items) * 100 AS freight_to_revenue_pct
FROM fact_order_items;

-- 20. Repeat Customers
WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(DISTINCT order_id) AS order_count
    FROM fact_orders
    GROUP BY customer_id
)
SELECT
    COUNT(*) AS total_customers,
    SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) AS repeat_customers,
    SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) AS one_time_customers,
    ROUND(SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS repeat_rate_pct
FROM customer_orders;

-- 21. One-Time Customers Detail
WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(DISTINCT order_id) AS order_count,
        SUM(price) AS total_spent
    FROM fact_orders fo
    JOIN fact_order_items foi ON fo.order_id = foi.order_id
    GROUP BY customer_id
)
SELECT
    customer_id,
    order_count,
    total_spent
FROM customer_orders
WHERE order_count = 1
ORDER BY total_spent DESC;

-- 22. Cancellation Rate
SELECT
    COUNT(*) AS total_orders,
    SUM(CASE WHEN order_status = 'canceled' THEN 1 ELSE 0 END) AS cancelled,
    ROUND(SUM(CASE WHEN order_status = 'canceled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS cancel_rate_pct
FROM fact_orders;

-- 23. Average Installments by Payment Type
SELECT
    payment_type,
    AVG(payment_installments) AS avg_installments,
    COUNT(*) AS count
FROM fact_payments
GROUP BY payment_type
ORDER BY avg_installments DESC;
