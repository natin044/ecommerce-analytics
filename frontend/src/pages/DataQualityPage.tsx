import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LoadingSpinner, { ErrorState } from '../components/States';

export default function DataQualityPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dataQuality()
      .then(setReport)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!report) return <ErrorState message="No data quality report available" />;

  const datasets = Object.entries(report).filter(([k]) => k !== 'cleaning_actions');
  const actions = report.cleaning_actions || [];

  let totalRows = 0;
  let totalMissing = 0;
  let totalDuplicates = 0;
  datasets.forEach(([, v]: [string, any]) => {
    totalRows += v.rows || 0;
    totalMissing += Object.values(v.missing_values || {}).reduce((a: number, b: any) => a + b, 0) as number;
    totalDuplicates += v.duplicate_count || 0;
  });
  const completeness = totalRows > 0 ? ((1 - totalMissing / (totalRows * 10)) * 100).toFixed(1) : '0';

  return (
    <div>
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Quality Score</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{completeness}%</div>
            <div className="text-sm text-slate-500 mt-1">Overall Completeness</div>
          </div>
          <div className="flex-1">
            <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{datasets.length}</div>
              <div className="text-xs text-slate-500">Datasets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{totalRows.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{totalMissing.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Missing Values</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{totalDuplicates.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Duplicates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {datasets.map(([name, info]: [string, any]) => (
          <div key={name} className="bg-white rounded-lg border border-slate-200 p-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">{name}</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-lg font-bold text-slate-800">{info.rows?.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Rows</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{info.columns}</div>
                <div className="text-xs text-slate-500">Columns</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-500">{info.duplicate_count || 0}</div>
                <div className="text-xs text-slate-500">Duplicates</div>
              </div>
            </div>
            {info.missing_values && Object.keys(info.missing_values).length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-slate-500 mb-1">Missing Values</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(info.missing_values).map(([col, count]) => (
                    <span key={col} className="inline-block bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded">
                      {col}: {String(count)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {actions.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Cleaning Actions</h3>
          <ul className="space-y-1">
            {actions.map((a: string, i: number) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">&#x2713;</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
