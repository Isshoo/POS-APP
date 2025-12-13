import { useState, useEffect } from 'react';
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineArrowPath, HiOutlineCube } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';
import Modal from './Modal.jsx';

const emptyForm = {
  sku: '',
  name: '',
  category: '',
  type: '',
  unit: '',
  price: '',
  stock: '',
};

const Products = () => {
  const products = useStore((state) => state.products);
  const archivedProducts = useStore((state) => state.archivedProducts);
  const createProduct = useStore((state) => state.createProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const getArchivedProducts = useStore((state) => state.getArchivedProducts);
  const restoreProduct = useStore((state) => state.restoreProduct);

  const [activeTab, setActiveTab] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  useEffect(() => {
    if (activeTab === 'archived') {
      getArchivedProducts();
    }
  }, [activeTab, getArchivedProducts]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      category: product.category || '',
      type: product.type || '',
      unit: product.unit || '',
      price: String(product.price || ''),
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
      price: Number(form.price) || 0,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus produk ini dan pindahkan ke arsip?')) return;
    const result = await deleteProduct(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Kembalikan produk ini dari arsip?')) return;
    const result = await restoreProduct(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const displayProducts = activeTab === 'active' ? products : archivedProducts;

  return (
    <section id="produk" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Katalog</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Produk</h2>
          <p className="text-base text-secondary">Kelola katalog produk dan daftar harga</p>
        </div>
        {activeTab === 'active' && (
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
            onClick={openNew}
          >
            <HiOutlinePlusCircle className="h-5 w-5" />
            Tambah Produk
          </button>
        )}
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
      <div className="flex gap-2 border-b border-blue-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 text-base font-medium border-b-2 transition ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-secondary hover:text-primaryDark'
          }`}
        >
          Aktif ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2.5 text-base font-medium border-b-2 transition ${
            activeTab === 'archived'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-secondary hover:text-primaryDark'
          }`}
        >
          Arsip ({archivedProducts.length})
        </button>
      </div>

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
              <label className="block text-sm font-medium text-secondary">Jenis</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Satuan</label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Harga</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
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
        {displayProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-base text-tertiary">
              {activeTab === 'active' ? 'Belum ada produk aktif' : 'Belum ada produk di arsip'}
            </p>
          </div>
        ) : (
          displayProducts.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition ${
                activeTab === 'archived' ? 'opacity-60' : ''
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-tertiary">
                {product.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-primaryDark">
                {product.name}
              </h3>
              <p className="text-base text-secondary">
                {formatCurrency(product.price)}
              </p>
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
                  {activeTab === 'active' ? (
                    <>
                      <button
                        onClick={() => openEdit(product)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        <HiOutlinePencilSquare className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center rounded-full border border-red-300 p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(product.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-green-300 px-3 py-1.5 text-sm text-green-600 hover:bg-green-600 hover:text-white transition"
                    >
                      <HiOutlineArrowPath className="h-4 w-4" />
                      Restore
                    </button>
                  )}
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
