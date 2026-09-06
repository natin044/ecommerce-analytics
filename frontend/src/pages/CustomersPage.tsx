import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner, { ErrorState } from '../components/States';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function CustomersPage() {
  const [summary, setSummary] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.customerSummary(),
      api.customers(),
      api.stateSales(),
    ]).then(([s, c, st]) => {
      setSummary(s);
      setCustomers(c.data || []);
      setStates(st.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!summary) return <ErrorState message="No customer data available" />;

  const filtered = search
    ? customers.filter((c) => c.customer_id?.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const sorted = [...filtered].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 100);

  return (
    <div>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <KPICard label="Total Customers" value={formatNumber(summary.total_customers)} />
        <KPICard label="Repeat Customers" value={formatNumber(summary.repeat_customers)} />
        <KPICard label="One-Time Customers" value={formatNumber(summary.one_time_customers)} />
        <KPICard label="Repeat Rate" value={formatPercent(summary.repeat_rate / 100)} />
        <KPICard label="Avg Customer Spend" value={formatCurrency(summary.avg_customer_spend)} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Customers by State">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={states.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="state" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatNumber(v)} />
              <Bar dataKey="customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Segmentation">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Repeat', value: summary.repeat_customers },
                  { name: 'One-Time', value: summary.one_time_customers },
                ]}
                cx="50%" cy="50%" outerRadius={110}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="table-card mb-6">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Customer Table (Top 100 by Spend)</h3>
          <input
            type="text"
            placeholder="Search customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm border border-slate-200 rounded px-3 py-1.5 w-64"
          />
        </div>
        <div className="overflow-auto max-h-[500px]">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Avg Order Value</th>
                <th>Avg Review</th>
                <th>First Order</th>
                <th>Last Order</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{c.customer_id}</td>
                  <td>{formatNumber(c.total_orders)}</td>
                  <td>{formatCurrency(c.total_spent)}</td>
                  <td>{formatCurrency(c.avg_order_value)}</td>
                  <td>{c.avg_review?.toFixed(1) || '-'}</td>
                  <td>{c.first_order?.split('T')[0] || '-'}</td>
                  <td>{c.last_order?.split('T')[0] || '-'}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${c.is_repeat ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {c.is_repeat ? 'Repeat' : 'One-Time'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
