import { useState } from 'react';
import { HiOutlinePlusCircle, HiOutlinePencilSquare } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { formatCurrency, formatNumberInput, toNumeric } from '../utils/format';
import { api } from '../lib/api';
import Modal from './Modal.jsx';

const emptyForm = {
  sku: '',
  name: '',
  category: '',
  type: '',
  unit: '',
  costPrice: '',
  price: '',
  stock: '',
};

const Products = () => {
  const products = useStore((state) => state.products);
  const createProduct = useStore((state) => state.createProduct);
  const updateProduct = useStore((state) => state.updateProduct);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  const openNew = async () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    
    // Fetch next auto-generated SKU
    try {
      const response = await api.get('/products/next-sku');
      if (response.data?.data?.sku) {
        setForm(prev => ({ ...prev, sku: response.data.data.sku }));
      }
    } catch (error) {
      console.error('Failed to get next SKU:', error);
    }
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      category: product.category || '',
      type: product.type || '',
      unit: product.unit || '',
      costPrice: product.costPrice ? formatNumberInput(String(product.costPrice)) : '',
      price: product.price ? formatNumberInput(String(product.price)) : '',
      stock: String(product.stock || ''),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      type: form.type,
      unit: form.unit,
      costPrice: toNumeric(form.costPrice),
      price: toNumeric(form.price),
      stock: Number(form.stock) || 0,
    };

    const result = editingId
      ? await updateProduct(editingId, payload)
      : await createProduct(payload);

    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setFormFeedback(null);
    } else {
      setFormFeedback(result.message);
    }
  };



  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="produk" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">DAFTAR BARANG</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Produk</h2>
          <p className="text-base text-secondary">Kelola produk dan daftar harga</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
          onClick={openNew}
        >
          <HiOutlinePlusCircle className="h-5 w-5" />
          Tambah Produk
        </button>
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

      {isFormOpen && (
        <Modal
          title={editingId ? 'Edit Produk' : 'Tambah Produk'}
          onClose={() => {
            setIsFormOpen(false);
            setEditingId(null);
            setForm(emptyForm);
            setFormFeedback(null);
          }}
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-secondary">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary">Nama Barang</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Kategori</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Merek</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Satuan</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="">Pilih Satuan</option>
                <option value="Pcs">Pcs</option>
                <option value="Buah">Buah</option>
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Liter">Liter</option>
                <option value="Meter">Meter</option>
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Lusin">Lusin</option>
                <option value="Unit">Unit</option>
                <option value="Set">Set</option>
                <option value="Batang">Batang</option>
                <option value="Lembar">Lembar</option>
                <option value="Roll">Roll</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Harga Beli</label>
              <input
                type="text"
                inputMode="numeric"
                name="costPrice"
                value={form.costPrice}
                onChange={(e) => setForm(prev => ({ ...prev, costPrice: formatNumberInput(e.target.value) }))}
                required
                placeholder="Modal/HPP"
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Harga Jual</label>
              <input
                type="text"
                inputMode="numeric"
                name="price"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: formatNumberInput(e.target.value) }))}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Stok</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              {formFeedback && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formFeedback}
                </p>
              )}
            </div>
            <div className="flex items-end justify-end gap-3 md:col-span-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setForm(emptyForm);
                  setFormFeedback(null);
                }}
                className="rounded-full border-2 border-blue-200 px-5 py-2.5 text-base font-medium text-secondary hover:bg-surface min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-blue-700 min-h-[44px]"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Product Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-base text-tertiary">Belum ada produk</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-tertiary">
                {product.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-primaryDark">
                {product.name}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-secondary">
                  Harga Beli: <span className="font-medium text-primaryDark">{formatCurrency(product.costPrice || 0)}</span>
                </p>
                <p className="text-base text-primaryDark font-semibold">
                  Harga Jual: {formatCurrency(product.price)}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-secondary">Jenis:</span>
                  <p className="font-medium text-primaryDark">{product.type || '-'}</p>
                </div>
                <div>
                  <span className="text-secondary">Satuan:</span>
                  <p className="font-medium text-primaryDark">{product.unit || '-'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">Stok</span>
                  <span className={`text-base font-semibold ${
                    product.stock < 10 ? 'text-red-600' : 'text-primaryDark'
                  }`}>
                    {product.stock}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition"
                  >
                    <HiOutlinePencilSquare className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Products;
