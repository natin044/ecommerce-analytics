import { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: number;
}

export default function KPICard({ label, value, sub, icon, trend }: Props) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <span className="kpi-value">{value}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
      {trend !== undefined && (
        <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs prev
        </span>
      )}
    </div>
  );
}
