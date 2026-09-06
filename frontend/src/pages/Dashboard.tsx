import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatNumber, formatPercent, formatDecimal } from '../lib/utils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner, { EmptyState, ErrorState } from '../components/States';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, Star, Clock, AlertTriangle, XCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

interface Props {
  filterParams: Record<string, string>;
}

export default function Dashboard({ filterParams }: Props) {
  const [kpis, setKpis] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [k, m, c, s, p, pay, r, d] = await Promise.all([
        api.kpis(filterParams),
        api.monthlySales(),
        api.categorySales(),
        api.stateSales(),
        api.topProducts(10),
        api.payments(),
        api.reviews(),
        api.delivery(),
      ]);
      setKpis(k);
      setMonthly(m.data || []);
      setCategories(c.data || []);
      setStates(s.data || []);
      setTopProducts(p.data || []);
      setPayments(pay.data || []);
      setReviews(r.data || []);
      setDelivery(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [JSON.stringify(filterParams)]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!kpis) return <EmptyState message="No data available" />;

  return (
    <div>
      <FilterBar />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Revenue" value={formatCurrency(kpis.total_revenue)} icon={<DollarSign size={18} />} />
        <KPICard label="Total Orders" value={formatNumber(kpis.total_orders)} icon={<ShoppingCart size={18} />} />
        <KPICard label="Total Customers" value={formatNumber(kpis.total_customers)} icon={<Users size={18} />} />
        <KPICard label="Avg Order Value" value={formatCurrency(kpis.avg_order_value)} icon={<DollarSign size={18} />} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard label="Avg Review Score" value={formatDecimal(kpis.avg_review_score)} sub="out of 5" icon={<Star size={18} />} />
        <KPICard label="Avg Delivery Days" value={formatDecimal(kpis.avg_delivery_days, 1)} sub="days" icon={<Clock size={18} />} />
        <KPICard label="Late Delivery Rate" value={formatPercent(kpis.late_delivery_rate)} icon={<AlertTriangle size={18} />} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Monthly Revenue">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year_month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Monthly Orders">
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year_month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Revenue by Category">
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Revenue by State">
          {states.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={states.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <ChartCard title="Top 10 Products">
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="product_name" tick={{ fontSize: 9 }} width={100} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Order Status Distribution">
          {delivery?.status_distribution ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(delivery.status_distribution).map(([k, v]) => ({ name: k, value: v }))}
                  cx="50%" cy="50%" outerRadius={100}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.keys(delivery.status_distribution).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Payment Method Distribution">
          {payments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={payments.map((p) => ({ name: p.payment_type, value: p.count }))}
                  cx="50%" cy="50%" outerRadius={100}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {payments.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Review Score Distribution">
          {reviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reviews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        <ChartCard title="Freight vs Product Revenue">
          {kpis && (
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-center">
                <div className="flex gap-8 justify-center mb-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{formatCurrency(kpis.total_revenue)}</div>
                    <div className="text-xs text-slate-500 mt-1">Product Revenue</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-500">{formatCurrency(kpis.total_freight)}</div>
                    <div className="text-xs text-slate-500 mt-1">Freight Revenue</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(kpis.total_revenue / (kpis.total_revenue + kpis.total_freight)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Revenue: {((kpis.total_revenue / (kpis.total_revenue + kpis.total_freight)) * 100).toFixed(1)}%</span>
                  <span>Freight: {((kpis.total_freight / (kpis.total_revenue + kpis.total_freight)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
