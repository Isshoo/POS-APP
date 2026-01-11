import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi2';

const Reports = () => {
  const transactions = useStore((state) => state.transactions);
  const [expandedReport, setExpandedReport] = useState(null);

  const calculateReport = (daysBack) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const filteredTransactions = transactions.filter((trx) => {
      const trxDate = new Date(trx.timestamp);
      return trxDate >= startDate;
    });

    const totalPayment = filteredTransactions.reduce((sum, trx) => sum + trx.totalPayment, 0);
    const profit = filteredTransactions.reduce((sum, trx) => sum + trx.profit, 0);

    // Calculate product breakdown
    const productBreakdown = {};
    filteredTransactions.forEach((trx) => {
      trx.rawItems?.forEach((item) => {
        const productName = item.product?.name || item.name;
        if (!productBreakdown[productName]) {
          productBreakdown[productName] = {
            productName,
            quantitySold: 0,
            revenue: 0,
          };
        }
        productBreakdown[productName].quantitySold += item.quantity;
        productBreakdown[productName].revenue += item.subtotal || (item.quantity * item.price);
      });
    });

    const products = Object.values(productBreakdown).sort((a, b) => b.revenue - a.revenue);

    return {
      totalPayment,
      profit,
      products,
      transactionCount: filteredTransactions.length,
    };
  };

  const reports = useMemo(() => {
    return [
      { id: 'daily', label: 'Harian', data: calculateReport(0) },
      { id: 'weekly', label: 'Mingguan', data: calculateReport(7) },
      { id: 'monthly', label: 'Bulanan', data: calculateReport(30) },
      { id: 'yearly', label: 'Tahunan', data: calculateReport(365) },
    ];
  }, [transactions]);

  const toggleExpand = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  return (
    <section id="laporan" className="section-anchor space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Laporan</h2>
        <p className="text-sm text-gray-500">Detail produk terjual</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <div key={report.id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{report.label}</p>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                {report.data.transactionCount} trx
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Total Penjualan</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(report.data.totalPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Keuntungan Bersih</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(report.data.profit)}</p>
              </div>
            </div>
            
            {/* Expand button */}
            <button
              onClick={() => toggleExpand(report.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {expandedReport === report.id ? (
                <>
                  <HiOutlineChevronUp className="h-4 w-4" />
                  Sembunyikan Detail
                </>
              ) : (
                <>
                  <HiOutlineChevronDown className="h-4 w-4" />
                  Lihat Detail Produk
                </>
              )}
            </button>

            {/* Product breakdown */}
            {expandedReport === report.id && (
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Detail Produk Terjual
                </p>
                {report.data.products.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-2">Belum ada data</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {report.data.products.map((product) => (
                      <div key={product.productName} className="rounded-lg bg-white p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                            <p className="text-xs text-gray-500">{product.quantitySold} unit terjual</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">Informasi penjualan</h3>
        <p className="mt-2 text-sm text-gray-600">
          Laporan ini menampilkan ringkasan penjualan dan keuntungan untuk periode yang dipilih. 
          Klik "Lihat Detail Produk" pada setiap kartu untuk melihat breakdown produk yang terjual beserta jumlah dan revenue yang dihasilkan.
        </p>
      </div>
    </section>
  );
};

export default Reports;
