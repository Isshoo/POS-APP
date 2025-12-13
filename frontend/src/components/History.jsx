import { useState, useEffect } from 'react';
import { HiOutlineTrash, HiOutlineArrowPath, HiOutlineEye } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

const History = () => {
  const transactions = useStore((state) => state.transactions);
  const archivedTransactions = useStore((state) => state.archivedTransactions);
  const getArchivedTransactions = useStore((state) => state.getArchivedTransactions);
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  const restoreTransaction = useStore((state) => state.restoreTransaction);

  const [activeTab, setActiveTab] = useState('active');
  const [feedback, setFeedback] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (activeTab === 'archived') {
      getArchivedTransactions();
    }
  }, [activeTab, getArchivedTransactions]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini dan pindahkan ke arsip?')) return;
    const result = await deleteTransaction(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Kembalikan transaksi ini dari arsip? Stok produk akan dikembalikan.')) return;
    const result = await restoreTransaction(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const displayTransactions = activeTab === 'active' ? transactions : archivedTransactions;

  return (
    <section id="riwayat" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-gray-900">Riwayat Transaksi</h2>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'active'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Aktif ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'archived'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Arsip ({archivedTransactions.length})
        </button>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Detail Transaksi</h3>
            <p className="text-sm text-gray-500">{selectedTransaction.transactionId}</p>
            <div className="mt-4 space-y-2">
              {selectedTransaction.rawItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product?.name} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(selectedTransaction.totalPayment)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-4 w-full rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.3em] text-gray-500">
            <tr>
              <th className="px-6 py-4">Kode Transaksi</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Keuntungan</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  {activeTab === 'active' ? 'Belum ada transaksi' : 'Belum ada transaksi di arsip'}
                </td>
              </tr>
            ) : (
              displayTransactions.map((trx) => (
                <tr key={trx.transactionId} className={`border-t border-gray-100 ${activeTab === 'archived' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{trx.transactionId}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(trx.timestamp)}</td>
                  <td className="px-6 py-4 text-gray-900">{trx.items} item</td>
                  <td className="px-6 py-4 text-gray-900">{formatCurrency(trx.totalPayment)}</td>
                  <td className="px-6 py-4 text-green-600">{formatCurrency(trx.profit)}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-full border border-blue-300 px-3 py-1 text-xs text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      onClick={() => setSelectedTransaction(trx)}
                    >
                      <HiOutlineEye className="h-3 w-3" />
                      Lihat
                    </button>
                    {activeTab === 'active' ? (
                      <button
                        className="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white transition"
                        onClick={() => handleDelete(trx.id)}
                      >
                        <HiOutlineTrash className="h-3 w-3" />
                        Hapus
                      </button>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1 rounded-full border border-green-300 px-3 py-1 text-xs text-green-600 hover:bg-green-600 hover:text-white transition"
                        onClick={() => handleRestore(trx.id)}
                      >
                        <HiOutlineArrowPath className="h-3 w-3" />
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default History;
