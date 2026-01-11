import { useMemo, useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineSquares2X2,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { formatCurrency, toNumeric } from '../utils/format';
import TransactionReceipt from './TransactionReceipt.jsx';

const Cashier = () => {
  const products = useStore((state) => state.products);
  const cart = useStore((state) => state.cart);
  const searchTerm = useStore((state) => state.searchTerm);
  const activeCategory = useStore((state) => state.activeCategory);
  const paymentInput = useStore((state) => state.paymentInput);

  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const setCategory = useStore((state) => state.setCategory);
  const setPaymentInput = useStore((state) => state.setPaymentInput);

  const addToCart = useStore((state) => state.addToCart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);
  const checkoutCart = useStore((state) => state.checkoutCart);

  const getFilteredProducts = useStore((state) => state.getFilteredProducts);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const lastTransaction = useStore((state) => state.lastTransaction);
  const clearLastTransaction = useStore((state) => state.clearLastTransaction);

  const filteredProducts = useMemo(() => getFilteredProducts(), [getFilteredProducts, searchTerm, activeCategory]);
  const cartTotal = useMemo(() => getCartTotal(), [getCartTotal, cart]);
  const paymentValue = toNumeric(paymentInput);
  const change = Math.max(paymentValue - cartTotal, 0);
  const [status, setStatus] = useState(null);

  const categoryOptions = useMemo(
    () => ['Semua', ...Array.from(new Set(products.map((item) => item.category)))],
    [products],
  );

  return (
    <section id="kasir" className="section-anchor space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Operasional</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Kasir Toko</h2>
          <p className="text-base text-secondary">Tampilkan produk, kelola keranjang, dan selesaikan pembayaran dengan cepat.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
          onClick={clearCart}
        >
          <HiOutlineTrash className="h-5 w-5" />
          Reset Keranjang
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-blue-200">
          <p className="text-sm uppercase tracking-[0.25em] text-secondary">Item di Keranjang</p>
          <p className="mt-2 text-3xl font-semibold text-primaryDark">{cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
        </div>
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-blue-200">
          <p className="text-sm uppercase tracking-[0.25em] text-secondary">Kategori</p>
          <p className="mt-2 text-3xl font-semibold text-primaryDark">{activeCategory}</p>
        </div>
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm border border-blue-200">
          <p className="text-sm uppercase tracking-[0.25em] text-secondary">Total Pembayaran</p>
          <p className="mt-2 text-3xl font-semibold text-primaryDark">{formatCurrency(cartTotal)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-tertiary" />
                <input
                  type="text"
                  placeholder="Cari nama produk atau SKU..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-full border-2 border-blue-200 bg-white pl-12 pr-4 py-3 text-base text-primaryDark placeholder:text-tertiary focus:border-blue-500 focus:outline-none min-h-[48px]"
                />
              </div>
              <div className="flex items-center gap-2 text-base text-secondary">
                <HiOutlineSparkles className="h-6 w-6" />
                {filteredProducts.length} produk ditampilkan
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] transition min-h-[44px] ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-secondary hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product.id)}
                className="rounded-2xl border border-blue-200 bg-white p-5 text-left shadow-sm transition hover:shadow-lg hover:border-blue-400 min-h-[120px]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">{product.category}</p>
                <p className="mt-2 text-lg font-semibold text-primaryDark">{product.name}</p>
                <p className="text-base text-secondary">{formatCurrency(product.price)}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-secondary">
                  <span>Stok {product.stock}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    <HiOutlineSquares2X2 className="h-4 w-4" />
                    Tambah
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-base uppercase tracking-[0.2em] text-secondary">Keranjang</p>
              <span className="text-sm text-tertiary">{cart.length} produk</span>
            </div>
            <div className="mt-4 space-y-4">
              {!cart.length && (
                <p className="text-base text-tertiary">Belum ada item di keranjang.</p>
              )}
              {cart.map((item) => (
                <div key={item.id} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base text-primaryDark">{item.name}</p>
                      <p className="text-sm text-secondary">{formatCurrency(item.price)} • stok {item.stock}</p>
                    </div>
                    <button className="text-sm text-danger font-medium" onClick={() => removeFromCart(item.id)}>
                      Hapus
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-base text-secondary">
                    <label className="text-secondary font-medium">Qty</label>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) => updateCartQuantity(item.id, Number(event.target.value))}
                      className="w-32 rounded-full border border-blue-200 bg-surface px-4 py-2 text-right text-base font-semibold text-primaryDark min-h-[44px]"
                    />
                    <p className="font-semibold text-base text-primaryDark">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-base uppercase tracking-[0.2em] text-secondary">Total Pembayaran</p>
              <p className="text-3xl font-semibold text-primaryDark">{formatCurrency(cartTotal)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Jumlah Pembayaran</label>
              <div className="relative mt-2">
                <HiOutlineBanknotes className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-tertiary" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentInput}
                  onChange={(event) => setPaymentInput(event.target.value)}
                  placeholder="Masukkan nominal"
                  className="w-full rounded-2xl border-2 border-blue-200 bg-white pl-14 pr-4 py-4 text-right text-2xl font-semibold tracking-wide text-primaryDark min-h-[56px] focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-base shadow-sm border border-blue-200">
              <p className="text-secondary font-medium">Kembalian</p>
              <p className="text-xl font-semibold text-primaryDark">{formatCurrency(change)}</p>
            </div>
            {status && (
              <p
                className={`text-sm font-medium ${
                  status.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {status.text}
              </p>
            )}
            <button
              type="button"
              onClick={async () => {
                if (!cart.length) return;
                if (paymentValue < cartTotal) {
                  setStatus({ type: 'error', text: 'Jumlah pembayaran masih kurang.' });
                  return;
                }
                const result = await checkoutCart();
                if (result.success) {
                  setStatus({ type: 'success', text: result.message });
                  // Receipt popup akan muncul otomatis karena lastTransaction sudah diset di checkoutCart
                } else {
                  setStatus({ type: 'error', text: result.message });
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-tertiary min-h-[56px]"
              disabled={!cart.length || paymentValue < cartTotal}
            >
              <HiOutlineSparkles className="h-5 w-5" />
              Selesaikan Transaksi
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Popup */}
      {lastTransaction && (
        <TransactionReceipt
          transaction={lastTransaction}
          onClose={clearLastTransaction}
        />
      )}
    </section>
  );
};

export default Cashier;


