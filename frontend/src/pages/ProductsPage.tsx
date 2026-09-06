import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner, { ErrorState } from '../components/States';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.kpis(),
      api.categorySales(),
      api.topProducts(50),
    ]).then(([k, c, p]) => {
      setKpis(k);
      setCategories(c.data || []);
      setTopProducts(p.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!kpis) return <ErrorState message="No product data available" />;

  const filtered = search
    ? topProducts.filter((p) => p.product_name?.toLowerCase().includes(search.toLowerCase()) || p.product_id?.toLowerCase().includes(search.toLowerCase()))
    : topProducts;

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Categories" value={formatNumber(categories.length)} />
        <KPICard label="Total Products" value={formatNumber(topProducts.length)} />
        <KPICard label="Total Revenue" value={formatCurrency(kpis.total_revenue)} />
        <KPICard label="Avg Product Price" value={formatCurrency(kpis.total_revenue / Math.max(kpis.total_orders, 1))} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Top Categories by Revenue">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categories.slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={130} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Categories by Orders">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categories.slice(0, 15)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={130} />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="table-card">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">All Products (Top 50)</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm border border-slate-200 rounded px-3 py-1.5 w-64"
          />
        </div>
        <div className="overflow-auto max-h-[500px]">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product ID</th>
                <th>Category</th>
                <th>Revenue</th>
                <th>Quantity</th>
                <th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-mono text-xs">{p.product_id}</td>
                  <td>{p.product_name}</td>
                  <td>{formatCurrency(p.revenue)}</td>
                  <td>{formatNumber(p.quantity)}</td>
                  <td>{formatCurrency(p.avg_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
