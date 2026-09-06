import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatNumber, formatPercent, formatDecimal } from '../lib/utils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner, { ErrorState } from '../components/States';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function OrdersDeliveryPage() {
  const [delivery, setDelivery] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.kpis(),
      api.delivery(),
    ]).then(([k, d]) => {
      setKpis(k);
      setDelivery(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!delivery) return <ErrorState message="No delivery data available" />;

  const statusData = delivery.status_distribution
    ? Object.entries(delivery.status_distribution).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Orders" value={formatNumber(kpis?.total_orders || 0)} />
        <KPICard label="Total Delivered" value={formatNumber(delivery.total_delivered)} />
        <KPICard label="Late Orders" value={formatNumber(delivery.late_orders)} />
        <KPICard label="Late Delivery Rate" value={formatPercent(delivery.late_rate)} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Order Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%" outerRadius={110}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delivery Performance by Month">
          {delivery.monthly_delivery?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={delivery.monthly_delivery}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year_month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="avg_days" stroke="#3b82f6" name="Avg Days" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="late_rate" stroke="#ef4444" name="Late Rate" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="text-center py-8 text-slate-400 text-sm">No monthly data</div>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ChartCard title="Estimated vs Actual Delivery">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="flex gap-8 justify-center mb-6">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{formatDecimal(kpis?.avg_delivery_days || 0, 1)}</div>
                  <div className="text-xs text-slate-500 mt-1">Avg Actual Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{formatNumber(delivery.total_delivered)}</div>
                  <div className="text-xs text-slate-500 mt-1">Delivered Orders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{formatNumber(delivery.late_orders)}</div>
                  <div className="text-xs text-slate-500 mt-1">Late Orders</div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Status Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
