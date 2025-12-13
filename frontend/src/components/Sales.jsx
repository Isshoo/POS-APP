import { useState, useEffect } from 'react';
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineArrowPath } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import Modal from './Modal.jsx';

const emptyForm = {
  name: '',
  phone: '',
  company: '',
  clients: '',
};

const Sales = () => {
  const salesTeam = useStore((state) => state.salesTeam);
  const archivedSales = useStore((state) => state.archivedSales);
  const createSales = useStore((state) => state.createSales);
  const updateSales = useStore((state) => state.updateSales);
  const deleteSales = useStore((state) => state.deleteSales);
  const getArchivedSales = useStore((state) => state.getArchivedSales);
  const restoreSales = useStore((state) => state.restoreSales);

  const [activeTab, setActiveTab] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  useEffect(() => {
    if (activeTab === 'archived') {
      getArchivedSales();
    }
  }, [activeTab, getArchivedSales]);

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
      clients: String(sales.activeClients || ''),
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
      clients: Number(form.clients) || 0,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data sales ini dan pindahkan ke arsip?')) return;
    const result = await deleteSales(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) await getArchivedSales();
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Kembalikan data sales ini dari arsip?')) return;
    const result = await restoreSales(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const displaySales = activeTab === 'active' ? salesTeam : archivedSales;

  return (
    <section id="sales" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Tim Penjualan</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Sales</h2>
          <p className="text-base text-secondary">Kelola tim sales dan data klien</p>
        </div>
        {activeTab === 'active' && (
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
            onClick={openNew}
          >
            <HiOutlinePlusCircle className="h-5 w-5" />
            Tambah Sales
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
          Aktif ({salesTeam.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2.5 text-base font-medium border-b-2 transition ${
            activeTab === 'archived'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-secondary hover:text-primaryDark'
          }`}
        >
          Arsip ({archivedSales.length})
        </button>
      </div>

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
              <label className="block text-xs font-medium text-gray-500">Jumlah Klien Aktif</label>
              <input
                type="number"
                name="clients"
                value={form.clients}
                onChange={handleChange}
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
        {displaySales.length === 0 ? (
          <div className="md:col-span-3 text-center py-8 text-gray-400">
            {activeTab === 'active' ? 'Belum ada sales aktif' : 'Belum ada sales di arsip'}
          </div>
        ) : (
          displaySales.map((sales) => (
            <div key={sales.id} className={`rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition ${activeTab === 'archived' ? 'opacity-60' : ''}`}>
              <p className="text-sm uppercase tracking-[0.2em] text-tertiary">{sales.company}</p>
              <h3 className="mt-2 text-lg font-semibold text-primaryDark">{sales.name}</h3>
              <p className="text-base text-secondary">{sales.phone}</p>
              <p className="mt-3 text-sm text-secondary">{sales.activeClients} klien aktif</p>
              <div className="mt-6 flex items-center gap-2 border-t border-blue-100 pt-4">
                {activeTab === 'active' ? (
                  <>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      onClick={() => openEdit(sales)}
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600 hover:text-white transition"
                      onClick={() => handleDelete(sales.id)}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      Hapus
                    </button>
                  </>
                ) : (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-green-300 px-3 py-1.5 text-sm text-green-600 hover:bg-green-600 hover:text-white transition"
                    onClick={() => handleRestore(sales.id)}
                  >
                    <HiOutlineArrowPath className="h-4 w-4" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Sales;
