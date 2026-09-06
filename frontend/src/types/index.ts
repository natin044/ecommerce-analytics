export interface KPIs {
  total_revenue: number;
  total_freight: number;
  gross_sales: number;
  total_orders: number;
  total_customers: number;
  avg_order_value: number;
  avg_review_score: number;
  avg_delivery_days: number;
  late_delivery_rate: number;
  cancellation_rate: number;
}

export interface MonthlySales {
  year_month: string;
  revenue: number;
  orders: number;
  customers: number;
  avg_order_value: number;
  avg_review: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  orders: number;
}

export interface StateSales {
  state: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  revenue: number;
  quantity: number;
  avg_price: number;
}

export interface TopSeller {
  seller_id: string;
  revenue: number;
  orders: number;
  items_sold: number;
  seller_state?: string;
  seller_city?: string;
}

export interface CustomerMetric {
  customer_id: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  first_order: string;
  last_order: string;
  avg_review: number;
  is_repeat: boolean;
}

export interface CustomerSummary {
  total_customers: number;
  repeat_customers: number;
  one_time_customers: number;
  repeat_rate: number;
  avg_customer_spend: number;
}

export interface DeliveryAnalysis {
  status_distribution: Record<string, number>;
  total_delivered: number;
  avg_delivery_days: number;
  late_orders: number;
  late_rate: number;
  monthly_delivery?: MonthlyDelivery[];
}

export interface MonthlyDelivery {
  year_month: string;
  avg_days: number;
  late_rate: number;
  count: number;
}

export interface PaymentAnalysis {
  payment_type: string;
  count: number;
  total_value: number;
  avg_value: number;
  avg_installments: number;
}

export interface ReviewAnalysis {
  score: number;
  count: number;
}

export interface Insight {
  category: string;
  text: string;
}

export interface FilterOptions {
  states: string[];
  categories: string[];
  order_statuses: string[];
  payment_types: string[];
  date_range: { min: string | null; max: string | null };
}

export interface DataQualityReport {
  [key: string]: any;
}
