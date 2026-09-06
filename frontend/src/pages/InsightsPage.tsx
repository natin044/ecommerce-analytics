import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LoadingSpinner, { ErrorState, EmptyState } from '../components/States';

const CATEGORY_COLORS: Record<string, string> = {
  Sales: 'bg-blue-100 text-blue-700',
  Customers: 'bg-green-100 text-green-700',
  Products: 'bg-purple-100 text-purple-700',
  Operations: 'bg-orange-100 text-orange-700',
  Delivery: 'bg-red-100 text-red-700',
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.insights()
      .then((r) => setInsights(r.insights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (insights.length === 0) return <EmptyState message="No insights available. Ensure data is loaded." />;

  const grouped: Record<string, any[]> = {};
  insights.forEach((ins) => {
    if (!grouped[ins.category]) grouped[ins.category] = [];
    grouped[ins.category].push(ins);
  });

  return (
    <div>
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Automated Business Insights</h3>
        <p className="text-sm text-slate-500">Key findings calculated from the actual dataset. No hardcoded values.</p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700'}`}>
                {category}
              </span>
              <span className="text-xs text-slate-400">{items.length} insight{items.length !== 1 ? 's' : ''}</span>
            </div>
            <ul className="space-y-2">
              {items.map((ins, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="text-blue-500 mt-0.5 font-bold">●</span>
                  {ins.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
