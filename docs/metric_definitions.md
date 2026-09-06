# Metric Definitions

This document ensures consistency across SQL, Python/Pandas, React, and Power BI implementations.

## 1. Total Revenue

**Business Definition:** Sum of all product item prices across all orders. Does not include freight.

**Formula:** `SUM(order_items.price)`

**Source Table:** `FactOrderItems`

**Source Columns:** `price`

**SQL Implementation:**
```sql
SELECT SUM(price) AS total_revenue FROM fact_order_items;
```

**Python/Pandas Implementation:**
```python
total_revenue = order_items['price'].sum()
```

**React/API Implementation:**
```typescript
kpis.total_revenue  // served from backend calculation
```

**DAX Implementation:**
```dax
Total Revenue = SUM(FactOrderItems[price])
```

---

## 2. Total Freight

**Business Definition:** Sum of all freight/shipping costs.

**Formula:** `SUM(order_items.freight_value)`

**Source Table:** `FactOrderItems`

**Source Columns:** `freight_value`

**SQL:** `SELECT SUM(freight_value) FROM fact_order_items;`
**Python:** `order_items['freight_value'].sum()`
**DAX:** `Total Freight = SUM(FactOrderItems[freight_value])`

---

## 3. Gross Sales Including Freight

**Business Definition:** Sum of price + freight for all items.

**Formula:** `SUM(price + freight_value)`

**Source Table:** `FactOrderItems`

**Source Columns:** `item_revenue`

**SQL:** `SELECT SUM(item_revenue) FROM fact_order_items;`
**Python:** `order_items['item_revenue'].sum()`
**DAX:** `Gross Sales = SUM(FactOrderItems[item_revenue])`

---

## 4. Total Orders

**Business Definition:** Count of distinct order IDs.

**Formula:** `COUNT(DISTINCT order_id)`

**Source Table:** `FactOrders`

**Source Columns:** `order_id`

**SQL:** `SELECT COUNT(DISTINCT order_id) FROM fact_orders;`
**Python:** `orders['order_id'].nunique()`
**DAX:** `Total Orders = DISTINCTCOUNT(FactOrders[order_id])`

---

## 5. Total Customers

**Business Definition:** Count of distinct customer IDs (customer_id, not customer_unique_id).

**Formula:** `COUNT(DISTINCT customer_id)`

**Source Table:** `FactOrders` or `DimCustomer`

**Source Columns:** `customer_id`

**SQL:** `SELECT COUNT(DISTINCT customer_id) FROM fact_orders;`
**Python:** `orders['customer_id'].nunique()`
**DAX:** `Total Customers = DISTINCTCOUNT(FactOrders[customer_id])`

---

## 6. Average Order Value (AOV)

**Business Definition:** Total product revenue divided by total orders.

**Formula:** `SUM(price) / COUNT(DISTINCT order_id)`

**Source Tables:** `FactOrderItems`, `FactOrders`

**SQL:**
```sql
SELECT SUM(foi.price) / COUNT(DISTINCT fo.order_id) AS aov
FROM fact_orders fo JOIN fact_order_items foi ON fo.order_id = foi.order_id;
```

**Python:** `total_revenue / total_orders`
**DAX:** `Average Order Value = DIVIDE([Total Revenue], [Total Orders], 0)`

---

## 7. Average Review Score

**Business Definition:** Mean of all review scores (1-5 scale).

**Formula:** `AVG(review_score)`

**Source Table:** `FactReviews`

**Source Columns:** `review_score`

**SQL:** `SELECT AVG(review_score) FROM fact_reviews;`
**Python:** `reviews['review_score'].mean()`
**DAX:** `Average Review Score = AVERAGE(FactReviews[review_score])`

---

## 8. Delivery Days

**Business Definition:** Number of days from purchase to customer delivery.

**Formula:** `delivered_customer_date - order_purchase_timestamp`

**Source Table:** `FactOrders`

**Source Columns:** `delivery_days`

**SQL:** `SELECT delivery_days FROM fact_orders WHERE delivery_days IS NOT NULL;`
**Python:** `(orders['order_delivered_customer_date'] - orders['order_purchase_timestamp']).dt.days`
**DAX:** `AVERAGE(FactOrders[delivery_days])`

---

## 9. Late Delivery Rate

**Business Definition:** Proportion of delivered orders that arrived after the estimated date. Only counts orders with both actual and estimated delivery dates.

**Formula:** `COUNT(is_late = 1) / COUNT(delivered orders)`

**Source Table:** `FactOrders`

**Source Columns:** `is_late`, `delivered_customer_date`, `order_estimated_delivery_date`

**SQL:**
```sql
SELECT SUM(is_late) / COUNT(*) FROM fact_orders
WHERE delivered_customer_date IS NOT NULL;
```

**Python:** `orders['is_late'].mean()` (where delivered_customer_date is not null)

**DAX:**
```dax
Late Delivery Rate = 
DIVIDE(
    CALCULATE(COUNTROWS(FactOrders), FactOrders[is_late] = 1),
    CALCULATE(COUNTROWS(FactOrders), NOT(ISBLANK(FactOrders[delivered_customer_date]))),
    0
)
```

---

## 10. Cancellation Rate

**Business Definition:** Proportion of orders with status "canceled".

**Formula:** `COUNT(canceled orders) / COUNT(all orders)`

**Source Table:** `FactOrders`

**Source Columns:** `order_status`

**SQL:**
```sql
SELECT SUM(CASE WHEN order_status = 'canceled' THEN 1 ELSE 0 END) / COUNT(*)
FROM fact_orders;
```

**Python:** `(orders['order_status'] == 'canceled').mean()`
**DAX:**
```dax
Cancellation Rate = 
DIVIDE(
    CALCULATE(COUNTROWS(FactOrders), FactOrders[order_status] = "canceled"),
    [Total Orders],
    0
)
```

---

## Consistency Notes

1. Revenue never double-counts: calculated at item level, summed per order
2. Payment values are NOT added to revenue (different fact table)
3. Late delivery only counts orders where both dates exist
4. Customer count uses customer_id from orders, not customer_unique_id
5. All monetary values are in BRL (Brazilian Real)
6. Date filters apply to purchase_date
