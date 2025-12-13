import { useState, useEffect } from 'react';
import { 
  HiOutlinePlusCircle, 
  HiOutlineTrash, 
  HiOutlineArrowPath, 
  HiOutlinePencilSquare,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import Modal from './Modal.jsx';

const emptyForm = {
  productName: '',
  type: 'masuk',
  quantity: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

const Warehouse = () => {
  const warehouseEntries = useStore((state) => state.warehouseEntries);
  const archivedWarehouses = useStore((state) => state.archivedWarehouses);
  const createWarehouseEntry = useStore((state) => state.createWarehouseEntry);
  const updateWarehouseEntry = useStore((state) => state.updateWarehouseEntry);
  const deleteWarehouseEntry = useStore((state) => state.deleteWarehouseEntry);
  const getArchivedWarehouses = useStore((state) => state.getArchivedWarehouses);
  const restoreWarehouse = useStore((state) => state.restoreWarehouse);

  const [activeTab, setActiveTab] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);
  const [formFeedback, setFormFeedback] = useState(null);

  useEffect(() => {
    if (activeTab === 'archived') {
      getArchivedWarehouses();
    }
  }, [activeTab, getArchivedWarehouses]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormFeedback(null);
    setIsFormOpen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      productName: entry.productName,
      type: entry.type,
      quantity: String(entry.quantity),
      date: new Date(entry.date).toISOString().split('T')[0],
      notes: entry.notes || '',
    });
    setFormFeedback(null);
    setIsFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      productName: form.productName.trim(),
      type: form.type,
      quantity: Number(form.quantity),
      date: form.date,
      notes: form.notes.trim() || null,
    };

    let result;
    if (editingId) {
      result = await updateWarehouseEntry(editingId, payload);
    } else {
      result = await createWarehouseEntry(payload);
    }

    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setFormFeedback(null);
    } else {
      setFormFeedback(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pencatatan ini dan pindahkan ke arsip?')) return;
    const result = await deleteWarehouseEntry(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Kembalikan pencatatan ini dari arsip?')) return;
    const result = await restoreWarehouse(id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const displayEntries = activeTab === 'active' ? warehouseEntries : archivedWarehouses;

  return (
    <section id="gudang" className="section-anchor space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Warehouse</p>
          <h2 className="mt-1 text-3xl font-semibold text-primaryDark">Gudang</h2>
          <p className="text-base text-secondary">Pencatatan barang masuk dan keluar gudang</p>
        </div>
        {activeTab === 'active' && (
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
            onClick={openNew}
          >
            <HiOutlinePlusCircle className="h-5 w-5" />
            Tambah Catatan
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
          Aktif ({warehouseEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2.5 text-base font-medium border-b-2 transition ${
            activeTab === 'archived'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-secondary hover:text-primaryDark'
          }`}
        >
          Arsip ({archivedWarehouses.length})
        </button>
      </div>

      {isFormOpen && (
        <Modal
          title={editingId ? 'Edit Catatan Gudang' : 'Tambah Catatan Gudang'}
          onClose={() => {
            setIsFormOpen(false);
            setForm(emptyForm);
            setEditingId(null);
            setFormFeedback(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary">Nama Produk</label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                placeholder="Masukkan nama produk"
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Tipe</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              >
                <option value="masuk">Barang Masuk</option>
                <option value="keluar">Barang Keluar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Jumlah</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="1"
                placeholder="Masukkan jumlah"
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Catatan (opsional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Tambahkan catatan jika diperlukan"
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            {formFeedback && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {formFeedback}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setForm(emptyForm);
                  setEditingId(null);
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
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Table */}
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="min-w-full text-left">
          <thead className="text-sm uppercase tracking-[0.25em] text-secondary border-b border-blue-200">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Nama Produk</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Jumlah</th>
              <th className="px-6 py-4">Catatan</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-base text-tertiary">
                  {activeTab === 'active' 
                    ? 'Belum ada pencatatan gudang' 
                    : 'Tidak ada arsip pencatatan'}
                </td>
              </tr>
            ) : (
              displayEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-blue-100">
                  <td className="px-6 py-4 text-base text-secondary">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 font-medium text-base text-primaryDark">{entry.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                      entry.type === 'masuk' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {entry.type === 'masuk' ? (
                        <HiOutlineArrowDownTray className="h-4 w-4" />
                      ) : (
                        <HiOutlineArrowUpTray className="h-4 w-4" />
                      )}
                      {entry.type === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-primaryDark">{entry.quantity}</td>
                  <td className="px-6 py-4 text-base text-secondary">{entry.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {activeTab === 'active' ? (
                        <>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition"
                            onClick={() => openEdit(entry)}
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600 hover:text-white transition"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                            Hapus
                          </button>
                        </>
                      ) : (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-full border border-green-300 px-3 py-1.5 text-sm text-green-600 hover:bg-green-600 hover:text-white transition"
                          onClick={() => handleRestore(entry.id)}
                        >
                          <HiOutlineArrowPath className="h-4 w-4" />
                          Restore
                        </button>
                      )}
                    </div>
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

export default Warehouse;
