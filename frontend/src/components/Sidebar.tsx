import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  FileCheck,
  Lightbulb,
} from 'lucide-react';

type Page = 'dashboard' | 'customers' | 'products' | 'orders' | 'data-quality' | 'insights';

const NAV_ITEMS: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customer Analytics', icon: Users },
  { id: 'products', label: 'Product Analytics', icon: Package },
  { id: 'orders', label: 'Orders & Delivery', icon: Truck },
  { id: 'data-quality', label: 'Data Quality', icon: FileCheck },
  { id: 'insights', label: 'Business Insights', icon: Lightbulb },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: Props) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-slate-900 text-white flex flex-col z-20">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">EA</div>
          <div>
            <div className="text-sm font-semibold">E-Commerce</div>
            <div className="text-xs text-slate-400">Analytics Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left ${
                active
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        Olist Brazilian E-Commerce Dataset
      </div>
    </aside>
  );
}
