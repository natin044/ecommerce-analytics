import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: Props) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-title">{title}</div>
      {children}
    </div>
  );
}
