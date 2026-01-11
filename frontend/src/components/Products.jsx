import { useState } from 'react';
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineCog6Tooth, HiOutlineTrash } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { formatCurrency, formatNumberInput, toNumeric } from '../utils/format';
import { api } from '../lib/api';
import Modal from './Modal.jsx';

const emptyForm = {
  sku: '',
  name: '',
  categoryId: '',
  type: '',
  unitId: '',
  costPrice: '',
  price: '',
  stock: '',
};

const Products = () => {
  const products = useStore((state) => state.products);
  const units = useStore((state) => state.units);
  const categories = useStore((state) => state.categories);
  const createProduct = useStore((state) => state.createProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const createUnit = useStore((state) => state.createUnit);
  const deleteUnit = useStore((state) => state.deleteUnit);
  const createCategory = useStore((state) => state.createCategory);
  const deleteCategory = useStore((state) => state.deleteCategory);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  // Unit Management Modal State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [unitFeedback, setUnitFeedback] = useState(null);

  // Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState(null);

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
      categoryId: product.categoryId || '',
      type: product.type || '',
      unitId: product.unitId || '',
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
      categoryId: form.categoryId || null,
      type: form.type,
      unitId: form.unitId || null,
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

  // Unit Management Functions
  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    const result = await createUnit(newUnitName.trim());
    if (result.success) {
      setNewUnitName('');
      setUnitFeedback({ type: 'success', text: result.message });
    } else {
      setUnitFeedback({ type: 'error', text: result.message });
    }
  };

  const handleDeleteUnit = async (id) => {
    const result = await deleteUnit(id);
    if (result.success) {
      setUnitFeedback({ type: 'success', text: result.message });
    } else {
      setUnitFeedback({ type: 'error', text: result.message });
    }
  };

  // Category Management Functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const result = await createCategory(newCategoryName.trim());
    if (result.success) {
      setNewCategoryName('');
      setCategoryFeedback({ type: 'success', text: result.message });
    } else {
      setCategoryFeedback({ type: 'error', text: result.message });
    }
  };

  const handleDeleteCategory = async (id) => {
    const result = await deleteCategory(id);
    if (result.success) {
      setCategoryFeedback({ type: 'success', text: result.message });
    } else {
      setCategoryFeedback({ type: 'error', text: result.message });
    }
  };

  return (
    <section id="produk" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">DAFTAR BARANG</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Produk</h2>
          <p className="text-base text-secondary">Kelola produk dan daftar harga</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
            onClick={openNew}
          >
            <HiOutlinePlusCircle className="h-5 w-5" />
            Tambah Produk
          </button>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              onClick={() => {
                setIsCategoryModalOpen(true);
                setCategoryFeedback(null);
              }}
              title="Kelola Kategori"
            >
              <HiOutlineCog6Tooth className="h-4 w-4" />
              Kelola Kategori
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              onClick={() => {
                setIsUnitModalOpen(true);
                setUnitFeedback(null);
              }}
              title="Kelola Satuan"
            >
              <HiOutlineCog6Tooth className="h-4 w-4" />
              Kelola Satuan
            </button>
          </div>
        </div>
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
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
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
                name="unitId"
                value={form.unitId}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="">Pilih Satuan</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
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

      {/* Unit Management Modal */}
      {isUnitModalOpen && (
        <Modal
          title="Kelola Satuan"
          onClose={() => {
            setIsUnitModalOpen(false);
            setNewUnitName('');
            setUnitFeedback(null);
          }}
        >
          <div className="space-y-4">
            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Nama satuan baru..."
                className="flex-1 rounded-lg border-2 border-blue-200 bg-white px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-700 transition"
              >
                Tambah
              </button>
            </form>

            {unitFeedback && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  unitFeedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {unitFeedback.text}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {units.length === 0 ? (
                <p className="text-center text-sm text-tertiary py-4">Belum ada satuan</p>
              ) : (
                <div className="space-y-2">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-4 py-2.5"
                    >
                      <span className="text-base text-primaryDark">{unit.name}</span>
                      <button
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                        title="Hapus satuan"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsUnitModalOpen(false);
                  setNewUnitName('');
                  setUnitFeedback(null);
                }}
                className="rounded-full border-2 border-blue-200 px-5 py-2 text-sm font-medium text-secondary hover:bg-surface"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <Modal
          title="Kelola Kategori"
          onClose={() => {
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
            setCategoryFeedback(null);
          }}
        >
          <div className="space-y-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama kategori baru..."
                className="flex-1 rounded-lg border-2 border-blue-200 bg-white px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-700 transition"
              >
                Tambah
              </button>
            </form>

            {categoryFeedback && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  categoryFeedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {categoryFeedback.text}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-center text-sm text-tertiary py-4">Belum ada kategori</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg border border-blue-100 bg-white px-4 py-2.5"
                    >
                      <span className="text-base text-primaryDark">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                        title="Hapus kategori"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                  setCategoryFeedback(null);
                }}
                className="rounded-full border-2 border-blue-200 px-5 py-2 text-sm font-medium text-secondary hover:bg-surface"
              >
                Tutup
              </button>
            </div>
          </div>
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
                {product.category || '-'}
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
