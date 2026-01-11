import { useState } from 'react';
import { HiOutlinePlusCircle, HiOutlinePencilSquare } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import Modal from './Modal.jsx';

const emptyForm = {
  name: '',
  phone: '',
  company: '',
  products: '',
};

const Sales = () => {
  const salesTeam = useStore((state) => state.salesTeam);
  const createSales = useStore((state) => state.createSales);
  const updateSales = useStore((state) => state.updateSales);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (sales) => {
    setEditingId(sales.id);
    setForm({
      name: sales.name || '',
      phone: sales.phone || '',
      company: sales.company || '',
      products: sales.products || '',
    });
    setIsFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone,
      company: form.company,
      products: form.products,
    };

    const result = editingId
      ? await updateSales(editingId, payload)
      : await createSales(payload);

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



  return (
    <section id="sales" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">SALES BARANG</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Sales</h2>
          <p className="text-base text-secondary">Kelola sales dan produk yang dijual</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
          onClick={openNew}
        >
          <HiOutlinePlusCircle className="h-5 w-5" />
          Tambah Sales
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
          title={editingId ? 'Edit Sales' : 'Tambah Sales'}
          onClose={() => {
            setIsFormOpen(false);
            setEditingId(null);
            setForm(emptyForm);
            setFormFeedback(null);
          }}
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500">Nama Sales</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">No. Telepon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Perusahaan</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Produk yang Dijual</label>
              <input
                type="text"
                name="products"
                value={form.products}
                onChange={handleChange}
                placeholder="Contoh: Semen, Pasir, Bata"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              {formFeedback && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {formFeedback}
                </p>
              )}
            </div>
            <div className="flex items-end justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                  setForm(emptyForm);
                  setFormFeedback(null);
                }}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Sales'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {salesTeam.length === 0 ? (
          <div className="md:col-span-3 text-center py-8 text-gray-400">
            Belum ada sales
          </div>
        ) : (
          salesTeam.map((sales) => (
            <div key={sales.id} className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <p className="text-sm uppercase tracking-[0.2em] text-tertiary">{sales.company}</p>
              <h3 className="mt-2 text-lg font-semibold text-primaryDark">{sales.name}</h3>
              <p className="text-base text-secondary">{sales.phone}</p>
              <p className="mt-3 text-sm text-secondary">Produk: {sales.products || '-'}</p>
              <div className="mt-6 flex items-center gap-2 border-t border-blue-100 pt-4">
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition"
                  onClick={() => openEdit(sales)}
                >
                  <HiOutlinePencilSquare className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Sales;
