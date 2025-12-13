import { HiOutlineCheckCircle, HiOutlineXMark, HiOutlinePrinter } from 'react-icons/hi2';
import { formatCurrency } from '../utils/format';

const TransactionReceipt = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-surfaceAlt px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineCheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <h3 className="text-xl font-semibold text-primaryDark">Transaksi Berhasil</h3>
                <p className="text-sm text-secondary">Kode: {transaction.transactionId || transaction.code}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-tertiary hover:bg-surface hover:text-secondary"
            >
              <HiOutlineXMark className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto px-6 py-5">
          <div className="mb-4 text-center">
            <p className="text-base text-secondary">
              {formatDate(transaction.timestamp || transaction.createdAt)}
            </p>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Detail Pembelian
            </h4>
            {transaction.rawItems && transaction.rawItems.map((item) => (
              <div key={item.id} className="flex justify-between rounded-lg bg-surface p-4">
                <div className="flex-1">
                  <p className="font-medium text-lg text-primaryDark">{item.product?.name || item.name}</p>  
                  <p className="text-base text-secondary">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-lg text-primaryDark">
                  {formatCurrency(item.subtotal || item.quantity * item.price)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 space-y-3 border-t border-surfaceAlt pt-4">
            <div className="flex justify-between text-base">
              <span className="text-secondary">Total Item</span>
              <span className="font-medium text-primaryDark">{transaction.items} item</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-primaryDark">Total</span>
              <span className="text-primaryDark">{formatCurrency(transaction.totalPayment)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-secondary">Pembayaran</span>
              <span className="font-medium text-primaryDark">{formatCurrency(transaction.totalPayment + transaction.change)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-green-50 px-4 py-3">
              <span className="font-medium text-lg text-green-700">Kembalian</span>
              <span className="text-2xl font-bold text-green-700">{formatCurrency(transaction.change)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-surfaceAlt px-6 py-5">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-base font-medium text-primary hover:bg-surface min-h-[52px]"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              Cetak Struk
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primaryDark min-h-[52px]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
