# Power BI Dashboard Specification

## PAGE 1: Executive Overview

### Layout: 2 rows

**Row 1: KPI Cards (5 cards)**
| Position | Visual | Measure | Label |
|----------|--------|---------|-------|
| 1 | Card | Total Revenue | Total Revenue |
| 2 | Card | Total Orders | Total Orders |
| 3 | Card | Total Customers | Total Customers |
| 4 | Card | Average Order Value | AOV |
| 5 | Card | Average Review Score | Avg Review |

**Row 2: Charts (2 columns)**
| Position | Visual | Data | Details |
|----------|--------|------|---------|
| Left | Area Chart | Monthly Revenue | X: year_month, Y: Revenue |
| Right | Bar Chart | Revenue by State | X: state, Y: Revenue, top 10 |

**Row 3: Charts (3 columns)**
| Position | Visual | Data | Details |
|----------|--------|------|---------|
| Left | Pie Chart | Order Status | Categories by status |
| Center | Bar Chart | Top 10 Products | Horizontal bars |
| Right | KPI Card | Late Delivery Rate | Red if > 10% |

### Slicers (Top of page)
- Date Range (from DimDate or FactOrders[purchase_date])
- State (from DimCustomer[customer_state])
- Category (from DimProduct[product_category_name_english])
- Order Status (from FactOrders[order_status])
- Payment Type (from FactPayments[payment_type])

---

## PAGE 2: Sales Analytics

### Layout

**Row 1: KPI Cards (4 cards)**
| Visual | Measure |
|--------|---------|
| Card | Total Revenue |
| Card | Total Freight |
| Card | Gross Sales |
| Card | Freight to Revenue Ratio |

**Row 2: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Line Chart | Monthly Revenue Trend |
| Line Chart | Monthly Orders Trend |

**Row 3: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Bar Chart (horizontal) | Revenue by Category (top 15) |
| Bar Chart | Revenue by State (top 15) |

**Row 4: Tables (2 columns)**
| Visual | Data |
|--------|------|
| Table | Top 20 Products (ID, Category, Revenue, Quantity) |
| Table | Top 20 Sellers (ID, State, Revenue, Orders) |

---

## PAGE 3: Customer Analytics

### Layout

**Row 1: KPI Cards (5 cards)**
| Visual | Measure |
|--------|---------|
| Card | Total Customers |
| Card | Repeat Customers |
| Card | One-Time Customers |
| Card | Repeat Customer Rate |
| Card | Avg Customer Spend |

**Row 2: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Bar Chart | Customers by State |
| Donut Chart | Customer Segmentation (Repeat vs One-Time) |

**Row 3: Table**
| Visual | Data |
|--------|------|
| Table | Customer Details (ID, Orders, Spend, AOV, Review, First/Last Order, Type) |

---

## PAGE 4: Product Analytics

### Layout

**Row 1: KPI Cards (3 cards)**
| Visual | Measure |
|--------|---------|
| Card | Total Categories |
| Card | Total Products |
| Card | Avg Product Price |

**Row 2: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Bar Chart (horizontal) | Top Categories by Revenue |
| Bar Chart (horizontal) | Top Categories by Orders |

**Row 3: Table**
| Visual | Data |
|--------|------|
| Table | All Products (ID, Category, Revenue, Quantity, Avg Price) |

---

## PAGE 5: Delivery & Operations

### Layout

**Row 1: KPI Cards (4 cards)**
| Visual | Measure |
|--------|---------|
| Card | Total Orders |
| Card | Total Delivered |
| Card | Late Orders |
| Card | Late Delivery Rate |

**Row 2: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Pie Chart | Order Status Distribution |
| Line Chart | Delivery Performance by Month (Avg Days + Late Rate) |

**Row 3: Charts (2 columns)**
| Visual | Data |
|--------|------|
| Gauge | Late Delivery Rate (target: 10%) |
| Bar Chart | Status Breakdown |

---

## Formatting Guidelines

- Use consistent blue (#3b82f6) for primary metrics
- Use green (#10b981) for positive indicators
- Use red (#ef4444) for negative indicators (late, cancelled)
- Format currency as BRL (R$)
- Percentages: 1 decimal place
- Font: Segoe UI or similar
- Background: White
- Grid: Light gray borders
