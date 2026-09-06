import { useFilters } from '../App';

export default function FilterBar() {
  const { filters, setFilters, filterOptions } = useFilters();
  if (!filterOptions) return null;

  const toggle = (key: keyof typeof filters, value: string) => {
    setFilters({
      ...filters,
      [key]: (filters[key] as string[]).includes(value)
        ? (filters[key] as string[]).filter((v) => v !== value)
        : [...(filters[key] as string[]), value],
    });
  };

  const clearAll = () => {
    setFilters({ state: [], category: [], order_status: [], payment_type: [], date_from: '', date_to: '' });
  };

  const hasFilters = filters.state.length || filters.category.length || filters.order_status.length || filters.payment_type.length || filters.date_from || filters.date_to;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">Filters</span>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-800">
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Date From</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="text-sm border border-slate-200 rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Date To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="text-sm border border-slate-200 rounded px-2 py-1"
          />
        </div>
        {filterOptions.states?.length > 0 && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">State</label>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggle('state', e.target.value); }}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            >
              <option value="">Select...</option>
              {filterOptions.states.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {filters.state.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.state.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                    {s}
                    <button onClick={() => toggle('state', s)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {filterOptions.categories?.length > 0 && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Category</label>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggle('category', e.target.value); }}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            >
              <option value="">Select...</option>
              {filterOptions.categories.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {filters.category.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.category.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                    {c}
                    <button onClick={() => toggle('category', c)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {filterOptions.order_statuses?.length > 0 && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Order Status</label>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggle('order_status', e.target.value); }}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            >
              <option value="">Select...</option>
              {filterOptions.order_statuses.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {filters.order_status.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.order_status.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
                    {s}
                    <button onClick={() => toggle('order_status', s)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {filterOptions.payment_types?.length > 0 && (
          <div>
            <label className="block text-xs text-slate-500 mb-1">Payment Type</label>
            <select
              value=""
              onChange={(e) => { if (e.target.value) toggle('payment_type', e.target.value); }}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            >
              <option value="">Select...</option>
              {filterOptions.payment_types.map((p: string) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {filters.payment_type.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.payment_type.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                    {p}
                    <button onClick={() => toggle('payment_type', p)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
