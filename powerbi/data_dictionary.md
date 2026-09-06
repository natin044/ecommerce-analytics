# Power BI Data Dictionary

## Fact Tables

### FactOrders
| Column | Type | Description |
|--------|------|-------------|
| order_key | Integer | Primary key |
| order_id | Text | Order identifier |
| customer_id | Text | Customer identifier (FK to DimCustomer) |
| order_status | Text | Order status (delivered, shipped, canceled, etc.) |
| purchase_date | Date | Date of purchase |
| approved_date | DateTime | Approval timestamp |
| delivered_carrier_date | DateTime | Handed to carrier |
| delivered_customer_date | DateTime | Delivered to customer |
| estimated_delivery_date | DateTime | Estimated delivery |
| delivery_days | Number | Actual delivery days |
| estimated_delivery_days | Number | Estimated delivery days |
| is_late | Number | 1 if late, 0 if on time |

### FactOrderItems
| Column | Type | Description |
|--------|------|-------------|
| item_key | Integer | Primary key |
| order_id | Text | Order identifier (FK to FactOrders) |
| product_id | Text | Product identifier (FK to DimProduct) |
| seller_id | Text | Seller identifier (FK to DimSeller) |
| order_item_id | Number | Item sequence number |
| price | Currency | Item price (BRL) |
| freight_value | Currency | Freight cost (BRL) |
| item_revenue | Currency | price + freight_value |

### FactPayments
| Column | Type | Description |
|--------|------|-------------|
| payment_record_key | Integer | Primary key |
| order_id | Text | Order identifier (FK to FactOrders) |
| payment_type | Text | Payment method |
| payment_installments | Number | Number of installments |
| payment_value | Currency | Payment amount (BRL) |

### FactReviews
| Column | Type | Description |
|--------|------|-------------|
| review_key | Integer | Primary key |
| order_id | Text | Order identifier (FK to FactOrders) |
| review_score | Number | Score 1-5 |
| review_comment_title | Text | Review title |
| review_comment_message | Text | Review message |

## Dimension Tables

### DimCustomer
| Column | Type | Description |
|--------|------|-------------|
| customer_key | Integer | Primary key |
| customer_id | Text | Customer identifier |
| customer_unique_id | Text | Unique customer ID |
| customer_city | Text | City |
| customer_state | Text | State abbreviation |
| customer_zip_code_prefix | Text | ZIP code prefix |

### DimProduct
| Column | Type | Description |
|--------|------|-------------|
| product_key | Integer | Primary key |
| product_id | Text | Product identifier |
| product_category_name | Text | Category (Portuguese) |
| product_category_name_english | Text | Category (English) |
| product_name_lenght | Number | Name length |
| product_description_lenght | Number | Description length |
| product_photos_qty | Number | Photo count |
| product_weight_g | Number | Weight in grams |
| product_length_cm | Number | Length in cm |
| product_height_cm | Number | Height in cm |
| product_width_cm | Number | Width in cm |

### DimSeller
| Column | Type | Description |
|--------|------|-------------|
| seller_key | Integer | Primary key |
| seller_id | Text | Seller identifier |
| seller_zip_code_prefix | Text | ZIP code prefix |
| seller_city | Text | City |
| seller_state | Text | State |

### DimDate
| Column | Type | Description |
|--------|------|-------------|
| date_key | Integer | YYYYMMDD format |
| full_date | Date | Full date |
| year | Number | Year |
| month | Number | Month (1-12) |
| day | Number | Day |
| quarter | Number | Quarter (1-4) |
| day_of_week | Text | Day name |
| month_name | Text | Month name |
| week_of_year | Number | Week number |

### DimGeography
| Column | Type | Description |
|--------|------|-------------|
| geo_key | Integer | Primary key |
| zip_code_prefix | Text | ZIP code |
| latitude | Number | Latitude |
| longitude | Number | Longitude |
| city | Text | City |
| state | Text | State |

### DimPayment
| Column | Type | Description |
|--------|------|-------------|
| payment_key | Integer | Primary key |
| payment_type | Text | Payment type name |
