import { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import OrdersDeliveryPage from './pages/OrdersDeliveryPage';
import DataQualityPage from './pages/DataQualityPage';
import InsightsPage from './pages/InsightsPage';
import { api } from './lib/api';

export type Filters = {
  state: string[];
  category: string[];
  order_status: string[];
  payment_type: string[];
  date_from: string;
  date_to: string;
};

type FilterContextType = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  filterOptions: any;
};

export const FilterContext = createContext<FilterContextType>({
  filters: { state: [], category: [], order_status: [], payment_type: [], date_from: '', date_to: '' },
  setFilters: () => {},
  filterOptions: null,
});

export function useFilters() {
  return useContext(FilterContext);
}

type Page = 'dashboard' | 'customers' | 'products' | 'orders' | 'data-quality' | 'insights';

const PAGE_NAMES: Record<Page, string> = {
  dashboard: 'Dashboard',
  customers: 'Customer Analytics',
  products: 'Product Analytics',
  orders: 'Orders & Delivery',
  'data-quality': 'Data Quality',
  insights: 'Business Insights',
};

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [filters, setFilters] = useState<Filters>({
    state: [], category: [], order_status: [], payment_type: [],
    date_from: '', date_to: '',
  });
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [appReady, setAppReady] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  useEffect(() => {
    api.health().then((h) => {
      if (h.processed_files === 0) {
        setAppError('No processed data found. Please run the Python pipeline first:\n\ncd python && python data_cleaning.py && python analytics.py');
      } else {
        setAppReady(true);
      }
    }).catch(() => {
      setAppError('Cannot connect to backend. Please start the FastAPI server:\n\ncd backend && python main.py');
    });
  }, []);

  useEffect(() => {
    if (appReady) {
      api.filters().then(setFilterOptions).catch(() => {});
    }
  }, [appReady]);

  const filterParams: Record<string, string> = {};
  if (filters.state.length) filterParams.state = filters.state.join(',');
  if (filters.category.length) filterParams.category = filters.category.join(',');
  if (filters.order_status.length) filterParams.order_status = filters.order_status.join(',');
  if (filters.payment_type.length) filterParams.payment_type = filters.payment_type.join(',');
  if (filters.date_from) filterParams.date_from = filters.date_from;
  if (filters.date_to) filterParams.date_to = filters.date_to;

  if (appError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <div className="text-4xl mb-4">&#x26A0;</div>
          <h1 className="text-xl font-bold text-slate-800 mb-3">Setup Required</h1>
          <pre className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4 text-left whitespace-pre-wrap">{appError}</pre>
        </div>
      </div>
    );
  }

  if (!appReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard filterParams={filterParams} />;

      case 'customers': return <CustomersPage />;
      case 'products': return <ProductsPage />;
      case 'orders': return <OrdersDeliveryPage />;
      case 'data-quality': return <DataQualityPage />;
      case 'insights': return <InsightsPage />;
      default: return <Dashboard filterParams={filterParams} />;
    }
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, filterOptions }}>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar currentPage={page} onNavigate={setPage} />
        <main className="flex-1 ml-[260px] min-h-screen">
          <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
            <h1 className="text-lg font-semibold text-slate-800">{PAGE_NAMES[page]}</h1>
          </header>
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </FilterContext.Provider>
  );
}
