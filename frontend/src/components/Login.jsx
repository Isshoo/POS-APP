import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

const Login = () => {
  const login = useStore((state) => state.login);
  const isBootstrapping = useStore((state) => state.isBootstrapping);

  const [email, setEmail] = useState('admin@toko-bangunan.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [easterEgg, setEasterEgg] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (email === 'cukimai@gmail.com') {
      setEasterEgg(true);
    }
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
    }
  };

  useEffect(() => {
    if (easterEgg) {
      setTimeout(() => {
        setEasterEgg(false);
      }, 4000);
    } 
  }, [easterEgg]);

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-tertiary">Point of Sale</p>
          <p className="mt-2 text-3xl font-semibold text-primaryDark">Toko Sinar Jaya</p>
          <p className="mt-1 text-base text-secondary">Masuk untuk mengelola penjualan dan stok</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border-2 border-surfaceAlt bg-white px-4 py-3 text-lg min-h-[52px] focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-lg border-2 border-surfaceAlt bg-white px-4 py-3 text-lg min-h-[52px] focus:border-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isBootstrapping}
            className="mt-2 w-full rounded-full bg-primary px-6 py-4 text-lg font-semibold text-white hover:bg-primaryDark disabled:cursor-not-allowed disabled:bg-tertiary min-h-[52px]"
          >
            {isBootstrapping ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p className="mt-4 text-sm text-tertiary">
          Gunakan akun awal: <span className="font-semibold">admin@toko-bangunan.local / admin123</span> (bisa diubah
          nanti).
        </p>
      </div>
     
    </div>
     {easterEgg && (
      <div className="fixed hidden inset-0 z-40 flex items-center justify-center bg-black/40 px-4" onClick={() => setEasterEgg(false)}>
        <div className="glass w-full rounded-2xl p-6 shadow-xl">
          <iframe src="../../public/videoplayback.mp4" title="Easter Egg" allowFullScreen className="w-full h-full"></iframe>
        </div>
      </div>
      )}
    </>
  );
};
export default Login;
