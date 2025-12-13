import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const rangeToDate = (range) => {
  const now = new Date();
  if (range === 'today') {
    return new Date(now.setHours(0, 0, 0, 0));
  }
  if (range === 'week') {
    const date = new Date();
    date.setDate(now.getDate() - 7);
    return date;
  }
  if (range === 'month') {
    const date = new Date();
    date.setMonth(now.getMonth() - 1);
    return date;
  }
  return null;
};

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { range } = req.query;
    const since = rangeToDate(range);

    const transactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        ...(since && {
          createdAt: { gte: since },
        }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Riwayat transaksi berhasil diambil.',
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { items, payment } = req.body;

    // Validasi items ada dan tidak kosong
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item keranjang kosong atau tidak valid.' 
      });
    }

    // Validasi payment
    if (payment === undefined || payment === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Jumlah pembayaran wajib diisi.' 
      });
    }

    if (payment < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Jumlah pembayaran tidak boleh negatif.' 
      });
    }

    // Validasi setiap item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Setiap item harus memiliki productId, quantity, dan price.' 
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Jumlah item harus lebih dari 0.' 
        });
      }

      if (item.price < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Harga item tidak boleh negatif.' 
        });
      }

      // Cek produk ada
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Produk dengan ID ${item.productId} tidak ditemukan.` 
        });
      }

      // Cek stok cukup
      if (product.stock < item.quantity) {
        return res.status(409).json({ 
          success: false, 
          message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}.` 
        });
      }
    }

    const totalPayment = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Validasi pembayaran cukup
    if (payment < totalPayment) {
      return res.status(400).json({ 
        success: false, 
        message: `Pembayaran tidak mencukupi. Total: Rp ${totalPayment.toLocaleString('id-ID')}, Dibayar: Rp ${payment.toLocaleString('id-ID')}.` 
      });
    }

    const change = payment - totalPayment;
    const profit = Math.round(totalPayment * 0.18);

    const count = await prisma.transaction.count();
    const code = `TRX-${(1001 + count).toString().padStart(4, '0')}`;

    // Gunakan transaction untuk memastikan atomicity
    const transaction = await prisma.$transaction(async (tx) => {
      // Buat transaksi
      const newTransaction = await tx.transaction.create({
        data: {
          code,
          totalPayment,
          change,
          totalItems,
          profit,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            }
          },
        },
      });

      // Kurangi stok produk
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newTransaction;
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil disimpan.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaksi tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      message: 'Detail transaksi berhasil diambil.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaksi tidak ditemukan.' 
      });
    }

    if (existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Transaksi sudah dihapus sebelumnya.' 
      });
    }

    // Soft delete tanpa mengubah stok
    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus dan dipindahkan ke arsip.',
    });
  } catch (error) {
    next(error);
  }
});

// Get archived transactions
router.get('/archived/list', authenticate, async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { deletedAt: { not: null } },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Daftar transaksi arsip berhasil diambil.',
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// Restore deleted transaction
router.post('/:id/restore', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { 
        items: { 
          include: { product: true } 
        } 
      }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaksi tidak ditemukan.' 
      });
    }

    if (!existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Transaksi tidak dalam status arsip.' 
      });
    }

    // Restore: kembalikan stok produk
    await prisma.$transaction(async (tx) => {
      // Kembalikan stok untuk setiap item
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Restore transaksi
      await tx.transaction.update({
        where: { id },
        data: { deletedAt: null }
      });
    });

    res.json({
      success: true,
      message: 'Transaksi berhasil dikembalikan dari arsip dan stok telah dikembalikan.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;