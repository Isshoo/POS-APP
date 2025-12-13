import { useEffect, useState } from 'react';
import { HiOutlineUserPlus, HiOutlineTrash } from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import Modal from './Modal.jsx';

const AccountAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const user = useStore((state) => state.user);
  const users = useStore((state) => state.users);
  const getUsers = useStore((state) => state.getUsers);

  useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'admin',
        }),
      });

      const data = await response.json();
      setMessage(data.message || 'Terjadi kesalahan.');
      if (response.ok && data.success) {
        setName('');
        setEmail('');
        setPassword('');
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
      setMessage('Gagal terhubung ke server.');
    } finally {
      setIsSubmitting(false);
      getUsers();
    }
  };

  const handleDelete = async (id, userName) => {
    // Prevent deleting self
    if (user.id === id) {
      setMessage('Tidak dapat menghapus akun sendiri.');
      return;
    }

    if (!window.confirm(`Hapus akun "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      });

      const data = await response.json();
      setMessage(data.message || 'Terjadi kesalahan.');
      if (response.ok && data.success) {
        getUsers();
      }
    } catch (error) {
      console.error(error);
      setMessage('Gagal terhubung ke server.');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <section className="section-anchor space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary">Pengaturan</p>
          <h3 className="mt-1 text-3xl font-semibold text-primaryDark">Akun Admin</h3>
          <p className="text-base text-secondary">Kelola akun admin sistem</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition min-h-[48px]"
        >
          <HiOutlineUserPlus className="h-5 w-5" />
          Buat Admin Baru
        </button>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.includes('berhasil')
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-base text-tertiary">Belum ada akun admin</p>
          </div>
        ) : (
          users.map((admin) => (
            <div
              key={admin.id}
              className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-tertiary">
                    {admin.role}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-primaryDark">
                    {admin.name}
                  </h4>
                  <p className="text-base text-secondary">{admin.email}</p>
                </div>
                {user.id === admin.id && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                    Anda
                  </span>
                )}
              </div>
              <div className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-sm text-secondary">
                  Login Terakhir:{' '}
                  <span className="font-medium text-primaryDark">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('id-ID') : '-'}
                  </span>
                </p>
              </div>
              {user.id !== admin.id && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(admin.id, admin.name)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600 hover:text-white transition"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <Modal
          title="Buat Akun Admin Baru"
          onClose={() => {
            setIsOpen(false);
            setMessage('');
          }}
        >
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-secondary">Nama Lengkap</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setMessage('');
                }}
                className="rounded-full border-2 border-blue-200 px-5 py-2.5 text-base font-medium text-secondary hover:bg-surface min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-tertiary min-h-[44px]"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default AccountAdmin;
