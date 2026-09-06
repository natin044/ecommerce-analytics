# Power BI DAX Measures

Create these measures in a dedicated "Measures" table.

```dax
// ============================================================
// REVENUE MEASURES
// ============================================================

Total Revenue = 
SUM(FactOrderItems[price])

Total Freight = 
SUM(FactOrderItems[freight_value])

Gross Sales = 
SUM(FactOrderItems[item_revenue])

// ============================================================
// ORDER MEASURES
// ============================================================

Total Orders = 
DISTINCTCOUNT(FactOrders[order_id])

Total Order Items = 
COUNTROWS(FactOrderItems)

// ============================================================
// CUSTOMER MEASURES
// ============================================================

Total Customers = 
DISTINCTCOUNT(FactOrders[customer_id])

// ============================================================
// AVERAGE MEASURES
// ============================================================

Average Order Value = 
DIVIDE(
    [Total Revenue],
    [Total Orders],
    0
)

Average Review Score = 
AVERAGE(FactReviews[review_score])

Average Delivery Days = 
AVERAGE(FactOrders[delivery_days])

// ============================================================
// RATE MEASURES
// ============================================================

Late Delivery Rate = 
DIVIDE(
    CALCULATE(
        COUNTROWS(FactOrders),
        FactOrders[is_late] = 1
    ),
    CALCULATE(
        COUNTROWS(FactOrders),
        NOT(ISBLANK(FactOrders[delivered_customer_date]))
    ),
    0
)

Cancellation Rate = 
DIVIDE(
    CALCULATE(
        COUNTROWS(FactOrders),
        FactOrders[order_status] = "canceled"
    ),
    [Total Orders],
    0
)

// ============================================================
// GROWTH MEASURES
// ============================================================

Revenue Growth = 
VAR CurrentRevenue = [Total Revenue]
VAR PreviousRevenue = 
    CALCULATE(
        [Total Revenue],
        DATEADD(FactOrders[purchase_date], -1, MONTH)
    )
RETURN
    DIVIDE(
        CurrentRevenue - PreviousRevenue,
        PreviousRevenue,
        BLANK()
    )

// ============================================================
// SEGMENT MEASURES
// ============================================================

Repeat Customer Rate = 
VAR CustomersWithMultipleOrders = 
    CALCULATE(
        DISTINCTCOUNT(FactOrders[customer_id]),
        FILTER(
            VALUES(FactOrders[customer_id]),
            CALCULATE(DISTINCTCOUNT(FactOrders[order_id])) > 1
        )
    )
RETURN
    DIVIDE(
        CustomersWithMultipleOrders,
        [Total Customers],
        0
    )

// ============================================================
// MONTHLY MEASURES (for trend charts)
// ============================================================

Monthly Revenue = 
CALCULATE(
    [Total Revenue],
    DATESMTD(FactOrders[purchase_date])
)

// ============================================================
// COMPARISON MEASURES
// ============================================================

Freight to Revenue Ratio = 
DIVIDE(
    [Total Freight],
    [Total Revenue],
    0
)

Items per Order = 
DIVIDE(
    [Total Order Items],
    [Total Orders],
    0
)
```

## Measure Categories Summary

| Category | Measure | Formula |
|----------|---------|---------|
| Revenue | Total Revenue | SUM(FactOrderItems[price]) |
| Revenue | Total Freight | SUM(FactOrderItems[freight_value]) |
| Revenue | Gross Sales | SUM(FactOrderItems[item_revenue]) |
| Orders | Total Orders | DISTINCTCOUNT(FactOrders[order_id]) |
| Customers | Total Customers | DISTINCTCOUNT(FactOrders[customer_id]) |
| Averages | AOV | Total Revenue / Total Orders |
| Averages | Avg Review | AVERAGE(FactReviews[review_score]) |
| Averages | Avg Delivery | AVERAGE(FactOrders[delivery_days]) |
| Rates | Late Rate | Late orders / Delivered orders |
| Rates | Cancel Rate | Cancelled / Total Orders |
| Growth | Revenue MoM | (Current - Previous) / Previous |
| Segments | Repeat Rate | Multi-order customers / Total |
