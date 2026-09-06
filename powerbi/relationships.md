# Power BI Relationships

## Star Schema

```
                    DimDate
                       |
                       | (1:M) on date_key = FactOrders.purchase_date_key
                       |
    DimCustomer --- FactOrders --- FactOrderItems --- DimProduct
                       |    |              |
                       |    |              |--- DimSeller
                       |    |
                       |    +--- FactPayments
                       |
                       +--- FactReviews
```

## Relationships

| From Table | From Column | To Table | To Column | Cardinality | Cross-filter |
|------------|-------------|----------|-----------|-------------|--------------|
| FactOrders | customer_id | DimCustomer | customer_id | Many:1 | Single |
| FactOrders | order_id | FactOrderItems | order_id | 1:Many | Single |
| FactOrders | order_id | FactPayments | order_id | 1:Many | Single |
| FactOrders | order_id | FactReviews | order_id | 1:Many | Single |
| FactOrderItems | product_id | DimProduct | product_id | Many:1 | Single |
| FactOrderItems | seller_id | DimSeller | seller_id | Many:1 | Single |

## Notes

- All relationships use single cross-filter direction
- Date table can be connected via purchase_date column (create a calculated column for date_key)
- No many-to-many relationships in the base model
- All foreign keys should be validated for referential integrity
