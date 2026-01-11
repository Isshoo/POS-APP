import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HiOutlineBanknotes, HiOutlineShoppingBag, HiOutlineCube, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

const Dashboard = () => {
  const transactions = useStore((state) => state.transactions);
  const products = useStore((state) => state.products);

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = transactions.filter((trx) => {
      const trxDate = new Date(trx.timestamp);
      return trxDate >= today;
    });

    const totalSales = todayTransactions.reduce((sum, trx) => sum + trx.totalPayment, 0);
    const totalProfit = todayTransactions.reduce((sum, trx) => sum + trx.profit, 0);
    const totalItems = todayTransactions.reduce((sum, trx) => sum + trx.items, 0);

    return {
      totalSales,
      totalProfit,
      transactionCount: todayTransactions.length,
      totalItems,
    };
  }, [transactions]);

  // Calculate last 7 days data for chart
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTransactions = transactions.filter((trx) => {
        const trxDate = new Date(trx.timestamp);
        return trxDate >= date && trxDate < nextDate;
      });

      const totalSales = dayTransactions.reduce((sum, trx) => sum + trx.totalPayment, 0);

      data.push({
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        penjualan: totalSales,
      });
    }
    return data;
  }, [transactions]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = {};
    
    transactions.forEach((trx) => {
      trx.rawItems?.forEach((item) => {
        const productName = item.product?.name || item.name;
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.subtotal || (item.quantity * item.price);
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactions]);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <section id="dashboard" className="section-anchor space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Beranda</p>
        <h2 className="mt-1 text-4xl font-semibold text-primaryDark">Halaman beranda</h2>
        <p className="text-lg text-secondary">aktivitas dan performa toko hari ini</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary">Penjualan Hari Ini</p>
              <p className="mt-2 text-3xl font-semibold text-primaryDark">{formatCurrency(todayStats.totalSales)}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <HiOutlineBanknotes className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary">Total Transaksi</p>
              <p className="mt-2 text-3xl font-semibold text-primaryDark">{todayStats.transactionCount}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <HiOutlineShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary">Total Produk</p>
              <p className="mt-2 text-3xl font-semibold text-primaryDark">{products.length}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <HiOutlineCube className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary">Keuntungan Hari Ini</p>
              <p className="mt-2 text-3xl font-semibold text-primaryDark">{formatCurrency(todayStats.totalProfit)}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <HiOutlineArrowTrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-primaryDark">Grafik Penjualan 7 Hari Terakhir</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '14px' }} />
              <YAxis stroke="#475569" style={{ fontSize: '14px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Line type="monotone" dataKey="penjualan" stroke="#1e3a8a" strokeWidth={2} dot={{ fill: '#1e3a8a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-primaryDark">Produk Terlaris</h3>
          <div className="mt-4 space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-center text-lg text-tertiary py-4">Belum ada data penjualan</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-lg text-primaryDark">{product.name}</p>
                      <p className="text-sm text-secondary">{product.quantity} terjual</p>
                    </div>
                  </div>
                  <p className="font-semibold text-lg text-primaryDark">{formatCurrency(product.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-primaryDark">Transaksi Terakhir</h3>
          <div className="mt-4 space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-lg text-tertiary py-4">Belum ada transaksi</p>
            ) : (
              recentTransactions.map((trx) => (
                <div key={trx.transactionId} className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                  <div>
                    <p className="font-medium text-lg text-primaryDark">{trx.transactionId}</p>
                    <p className="text-sm text-secondary">
                      {new Date(trx.timestamp).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-primaryDark">{formatCurrency(trx.totalPayment)}</p>
                    <p className="text-sm text-green-600">+{formatCurrency(trx.profit)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
