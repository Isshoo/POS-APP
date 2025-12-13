import { useState, useEffect } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineCube, 
  HiOutlineUserGroup, 
  HiOutlineArchiveBox, 
  HiOutlineBanknotes, 
  HiOutlineChartBar, 
  HiOutlineClock,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3
} from 'react-icons/hi2';
import Dashboard from './components/Dashboard.jsx';
import Products from './components/Products.jsx';
import Sales from './components/Sales.jsx';
import Warehouse from './components/Warehouse.jsx';
import Cashier from './components/Cashier.jsx';
import Reports from './components/Reports.jsx';
import History from './components/History.jsx';
import AccountAdmin from './components/AccountAdmin.jsx';
import Login from './components/Login.jsx';
import { useStore } from './store/useStore.js';

const AppLayout = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const sections = [
    { id: 'dashboard', label: 'Beranda', path: '/', icon: HiOutlineHome },
    { id: 'produk', label: 'Produk', path: '/products', icon: HiOutlineCube },
    { id: 'sales', label: 'Sales', path: '/sales', icon: HiOutlineUserGroup },
    { id: 'gudang', label: 'Gudang', path: '/warehouse', icon: HiOutlineArchiveBox },
    { id: 'kasir', label: 'Kasir', path: '/cashier', icon: HiOutlineBanknotes },
    { id: 'laporan', label: 'Laporan', path: '/reports', icon: HiOutlineChartBar },
    { id: 'riwayat', label: 'Riwayat', path: '/history', icon: HiOutlineClock },
    { id: 'akun', label: 'Akun', path: '/admin/accounts', icon: HiOutlineUserGroup },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="border-b border-primary p-4">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">POS</p>
                <p className="text-2xl font-bold text-white">Toko Sinar Jaya</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-primary"
            >
              <HiOutlineBars3 className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.id}
                to={section.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3.5 text-lg font-medium transition ${
                    isActive
                      ? 'bg-blue-700/50 text-white'
                      : 'text-slate-200 hover:bg-primary hover:text-white'
                  }`
                }
                end={section.path === '/'}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                {sidebarOpen && <span>{section.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-primary p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-lg font-medium text-slate-200 hover:bg-primary hover:text-white"
          >
            <HiOutlineArrowRightOnRectangle className="h-6 w-6 flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

const App = () => {
  const isBootstrapping = useStore((state) => state.isBootstrapping);
  const user = useStore((state) => state.user);
  const bootstrap = useStore((state) => state.bootstrap);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!user) {
    return <Login />;
  }

  return (
    <AppLayout onLogout={logout}>
      {isBootstrapping && (
        <p className="mb-4 text-lg text-secondary">Memuat data dari server...</p>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin/accounts" element={<AccountAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
