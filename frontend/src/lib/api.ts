const API_BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => fetchJSON<{ status: string; processed_files: number; files: string[] }>('/health'),
  refresh: () => fetchJSON<{ status: string }>('/refresh', ),
  kpis: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJSON<any>(`/kpis${qs}`);
  },
  monthlySales: () => fetchJSON<{ data: any[] }>('/monthly-sales'),
  categorySales: () => fetchJSON<{ data: any[] }>('/category-sales'),
  stateSales: () => fetchJSON<{ data: any[] }>('/state-sales'),
  topProducts: (n = 10) => fetchJSON<{ data: any[] }>(`/top-products?n=${n}`),
  topSellers: (n = 10) => fetchJSON<{ data: any[] }>(`/top-sellers?n=${n}`),
  customers: () => fetchJSON<{ data: any[] }>('/customers'),
  customerSummary: () => fetchJSON<any>('/customer-summary'),
  delivery: () => fetchJSON<any>('/delivery'),
  payments: () => fetchJSON<{ data: any[] }>('/payments'),
  reviews: () => fetchJSON<{ data: any[]; avg_score: number; total_reviews: number }>('/reviews'),
  dataQuality: () => fetchJSON<any>('/data-quality'),
  insights: () => fetchJSON<{ insights: any[] }>('/insights'),
  filters: () => fetchJSON<any>('/filters'),
};
