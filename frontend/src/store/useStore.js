import { create } from 'zustand';
import { formatNumberInput, toNumeric } from '../utils/format';
import { api, setAccessToken } from '../lib/api';

const today = new Date();

const apiErrorMessage = (error, fallback = 'Terjadi kesalahan pada server.') =>
  error?.response?.data?.message || fallback;

const mapProduct = (product = {}) => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  type: product.type,
  unit: product.unit?.name || '',
  unitId: product.unitId,
  category: product.category?.name || '',
  categoryId: product.categoryId,
  costPrice: product.costPrice,
  price: product.price,
  stock: product.stock,
});

const mapSales = (sales = {}) => ({
  id: sales.id,
  name: sales.name,
  phone: sales.phone,
  company: sales.company,
  products: sales.products || '',
});

const mapWarehouseEntry = (entry = {}) => ({
  id: entry.id,
  productName: entry.productName,
  type: entry.type,
  quantity: entry.quantity,
  date: entry.date,
  notes: entry.notes,
});

const mapTransaction = (trx = {}) => ({
  id: trx.id,  // ID database untuk operasi delete/restore
  transactionId: trx.code || trx.transactionId,
  timestamp: trx.createdAt || trx.timestamp,
  items: trx.totalItems || trx.items,
  totalPayment: trx.totalPayment,
  change: trx.change,
  profit: trx.profit,
  rawItems: trx.items,
});

export const useStore = create((set, get) => ({
  // auth & loading
  user: null,
  isBootstrapping: false,
  isError: false,

  // master data
  products: [],
  salesTeam: [],
  warehouseEntries: [],
  transactions: [],
  reports: [],
  lastLoginUser: null,
  users: [],
  archivedTransactions: [],
  units: [],
  categories: [],
  cart: [],
  searchTerm: '',
  activeCategory: 'Semua',
  paymentInput: '',
  lastTransaction: null, // For receipt popup

  // ======= AUTH & BOOTSTRAP =======
  bootstrap: async () => {
    if (get().isBootstrapping) return;
    set({ isBootstrapping: true, isError: false });

    try {
      const meResponse = await api.get('/auth/me');
      const user = meResponse.data?.data;
      if (!user) {
        throw new Error('Pengguna tidak ditemukan.');
      }
      set({ user });

      await get().loadInitialData();
      set({ isBootstrapping: false });
    } catch (error) {
      set({ isBootstrapping: false, isError: false, user: null });
    }
  },

  login: async (email, password) => {
    set({ isBootstrapping: true, isError: false });
    try {
      const loginResponse = await api.post('/auth/login', { email, password });
      const { accessToken, user } = loginResponse.data.data;
      setAccessToken(accessToken);
      set({ user });
      await get().loadInitialData();
      set({ isBootstrapping: false });
      return { ok: true, message: loginResponse.data.message };
    } catch (error) {
      const message = apiErrorMessage(error, 'Login gagal.');
      set({ isBootstrapping: false, isError: true });
      return { ok: false, message };
    }
  },

  logout: () => {
    setAccessToken(null);
    set({
      user: null,
      products: [],
      salesTeam: [],
      warehouseEntries: [],
      transactions: [],
      reports: [],
      cart: [],
    });
  },

  loadInitialData: async () => {
    const [productsRes, salesRes, warehouseRes, trxRes, reportsRes, lastLoginRes, usersRes, unitsRes, categoriesRes] = await Promise.all([
      api.get('/products'),
      api.get('/sales'),
      api.get('/warehouses'),
      api.get('/transactions'),
      api.get('/reports'),
      api.get('/users/last-login'),
      api.get('/users'),
      api.get('/units'),
      api.get('/categories'),
    ]);

    const products = (productsRes.data?.data || []).map(mapProduct);
    const salesTeam = (salesRes.data?.data || []).map(mapSales);
    const warehouseEntries = (warehouseRes.data?.data || []).map(mapWarehouseEntry);
    const transactions = (trxRes.data?.data || []).map(mapTransaction);

    const reportsPayload = reportsRes.data?.data || {};
    const reports = [
      {
        id: 'daily',
        label: 'Harian',
        totalSales: reportsPayload.daily?._sum.totalPayment || 0,
        netProfit: reportsPayload.daily?._sum.profit || 0,
        trend: '+0%',
      },
      {
        id: 'weekly',
        label: 'Mingguan',
        totalSales: reportsPayload.weekly?._sum.totalPayment || 0,
        netProfit: reportsPayload.weekly?._sum.profit || 0,
        trend: '+0%',
      },
      {
        id: 'monthly',
        label: 'Bulanan',
        totalSales: reportsPayload.monthly?._sum.totalPayment || 0,
        netProfit: reportsPayload.monthly?._sum.profit || 0,
        trend: '+0%',
      },
      {
        id: 'yearly',
        label: 'Tahunan',
        totalSales: reportsPayload.yearly?._sum.totalPayment || 0,
        netProfit: reportsPayload.yearly?._sum.profit || 0,
        trend: '+0%',
      },
    ];

    set({
      products,
      salesTeam,
      warehouseEntries,
      transactions,
      reports,
      lastLoginUser: lastLoginRes.data?.data || null,
      users: usersRes.data?.data || [],
      units: unitsRes.data?.data || [],
      categories: categoriesRes.data?.data || [],
    });
  },

  // ======= FILTER & INPUT =======
  setSearchTerm: (value) => set({ searchTerm: value }),
  setCategory: (category) => set({ activeCategory: category }),
  setPaymentInput: (value) => set({ paymentInput: formatNumberInput(value) }),

  // ======= CRUD PRODUK =======
  createProduct: async (payload) => {
    try {
      const response = await api.post('/products', payload);
      const product = mapProduct(response.data.data);
      set((state) => ({
        products: [product, ...state.products],
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal membuat produk.') };
    }
  },

  updateProduct: async (id, payload) => {
    try {
      const response = await api.put(`/products/${id}`, payload);
      const product = mapProduct(response.data.data);
      set((state) => ({
        products: state.products.map((item) => (item.id === id ? product : item)),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal memperbarui produk.') };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((item) => item.id !== id),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus produk.') };
    }
  },

  regenerateAllSku: async () => {
    try {
      const response = await api.post('/products/regenerate-sku');
      // Reload products to get updated SKUs
      const productsRes = await api.get('/products');
      const products = (productsRes.data?.data || []).map(mapProduct);
      set({ products });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal memperbarui SKU.') };
    }
  },

  // ======= CRUD UNIT =======
  fetchUnits: async () => {
    try {
      const response = await api.get('/units');
      const units = response.data?.data || [];
      set({ units });
      return { success: true, data: units };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal mengambil daftar satuan.') };
    }
  },

  createUnit: async (name) => {
    try {
      const response = await api.post('/units', { name });
      const unit = response.data.data;
      set((state) => ({
        units: [...state.units, unit].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return { success: true, message: response.data.message, data: unit };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menambah satuan.') };
    }
  },

  deleteUnit: async (id) => {
    try {
      const response = await api.delete(`/units/${id}`);
      set((state) => ({
        units: state.units.filter((item) => item.id !== id),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus satuan.') };
    }
  },

  // ======= CRUD CATEGORY =======
  createCategory: async (name) => {
    try {
      const response = await api.post('/categories', { name });
      const category = response.data.data;
      set((state) => ({
        categories: [...state.categories, category].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return { success: true, message: response.data.message, data: category };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menambah kategori.') };
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((item) => item.id !== id),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus kategori.') };
    }
  },

  // ======= CRUD SALES =======
  createSales: async (payload) => {
    try {
      const response = await api.post('/sales', payload);
      const sales = mapSales(response.data.data);
      set((state) => ({
        salesTeam: [sales, ...state.salesTeam],
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal membuat data sales.') };
    }
  },

  updateSales: async (id, payload) => {
    try {
      const response = await api.put(`/sales/${id}`, payload);
      const sales = mapSales(response.data.data);
      set((state) => ({
        salesTeam: state.salesTeam.map((item) => (item.id === id ? sales : item)),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal memperbarui data sales.') };
    }
  },

  deleteSales: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      set((state) => ({
        salesTeam: state.salesTeam.filter((item) => item.id !== id),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus data sales.') };
    }
  },

  // ======= WAREHOUSE ENTRIES =======
  createWarehouseEntry: async (payload) => {
    try {
      const response = await api.post('/warehouses', payload);
      const entry = mapWarehouseEntry(response.data.data);
      set((state) => ({
        warehouseEntries: [entry, ...state.warehouseEntries],
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menambah catatan gudang.') };
    }
  },

  updateWarehouseEntry: async (id, payload) => {
    try {
      const response = await api.put(`/warehouses/${id}`, payload);
      const entry = mapWarehouseEntry(response.data.data);
      set((state) => ({
        warehouseEntries: state.warehouseEntries.map((item) =>
          item.id === id ? entry : item
        ),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal memperbarui catatan gudang.') };
    }
  },

  deleteWarehouseEntry: async (id) => {
    try {
      const response = await api.delete(`/warehouses/${id}`);
      set((state) => ({
        warehouseEntries: state.warehouseEntries.filter((item) => item.id !== id),
      }));
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus catatan gudang.') };
    }
  },

  addToCart: (productId) =>
    set((state) => {
      const product = state.products.find((item) => item.id === productId);
      if (!product) return state;

      const existing = state.cart.find((item) => item.id === productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === productId && item.quantity < product.stock
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      return {
        ...state,
        cart: [
          ...state.cart,
          {
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock,
          },
        ],
      };
    }),

  updateCartQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) }
          : item,
      ),
    })),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),

  clearCart: () => set({ cart: [], paymentInput: '' }),

  getCartTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),

  getFilteredProducts: () => {
    const { products, searchTerm, activeCategory } = get();
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  },

  getDashboardStats: () => {
    const { products, transactions } = get();
    const totalProducts = products.length;
    const todaysTransactions = transactions.filter(
      (trx) => new Date(trx.timestamp).toDateString() === today.toDateString(),
    );
    const todaySales = todaysTransactions.reduce((sum, trx) => sum + trx.totalPayment, 0);
    const latestTransactions = [...transactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4);
    return { totalProducts, todaySales, latestTransactions };
  },

  checkoutCart: async () => {
    const { cart, paymentInput } = get();
    if (!cart.length) return;

    const payment = toNumeric(paymentInput);
    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const response = await api.post('/transactions', { items, payment });
      const trx = response.data.data;
      const newTransaction = mapTransaction(trx);

      // update transaksi & stok produk di frontend
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        products: state.products.map((product) => {
          const updatedItem = trx.items.find((item) => item.productId === product.id);
          if (!updatedItem) return product;
          return { ...product, stock: product.stock - updatedItem.quantity };
        }),
        cart: [],
        paymentInput: '',
        lastTransaction: newTransaction, // Set for receipt popup
      }));

      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menyimpan transaksi.') };
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/users');
      const users = response.data?.data || [];
      set({ users });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal mengambil data pengguna.') };
    }
  },



  // ======= ARCHIVED TRANSACTIONS =======
  getArchivedTransactions: async () => {
    try {
      const response = await api.get('/transactions/archived/list');
      const archivedTransactions = (response.data?.data || []).map(mapTransaction);
      set({ archivedTransactions });
      return { success: true, data: archivedTransactions };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal mengambil transaksi arsip.') };
    }
  },

  restoreTransaction: async (id) => {
    try {
      const response = await api.post(`/transactions/${id}/restore`);
      await get().loadInitialData(); // Reload all data karena stok berubah
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal mengembalikan transaksi.') };
    }
  },

  deleteTransaction: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((item) => item.id !== id),
      }));
      // Refresh archived list
      await get().getArchivedTransactions();
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Gagal menghapus transaksi.') };
    }
  },

  // Update checkoutCart to store last transaction for receipt
  setLastTransaction: (transaction) => set({ lastTransaction: transaction }),
  clearLastTransaction: () => set({ lastTransaction: null }),
}));
