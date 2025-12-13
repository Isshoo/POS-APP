import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' } 
    });
    res.json({
      success: true,
      message: 'Daftar produk berhasil diambil.',
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, sku, price, stock, category, type, unit } = req.body;

    // Validasi input wajib
    if (!name || !sku) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama dan SKU produk wajib diisi.' 
      });
    }

    // Validasi nama produk sudah ada
    const existingByName = await prisma.product.findFirst({
      where: { 
        name: { 
          equals: name.trim(), 
          mode: 'insensitive' 
        } 
      }
    });

    if (existingByName) {
      return res.status(409).json({ 
        success: false, 
        message: 'Produk dengan nama ini sudah ada.' 
      });
    }

    // Validasi SKU produk sudah ada
    const existingBySku = await prisma.product.findFirst({
      where: { sku: sku.trim() }
    });

    if (existingBySku) {
      return res.status(409).json({ 
        success: false, 
        message: 'SKU produk sudah digunakan.' 
      });
    }

    // Validasi angka negatif
    if (price && price < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harga tidak boleh negatif.' 
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak boleh negatif.' 
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        category: category?.trim() || '',
        type: type?.trim() || '',
        unit: unit?.trim() || '',
        price: price || 0,
        stock: stock || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Produk baru berhasil ditambahkan.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock, category, type, unit } = req.body;

    // Validasi produk ada
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    // Validasi nama jika diubah
    if (name && name.trim() !== existing.name) {
      const duplicateName = await prisma.product.findFirst({
        where: { 
          name: { 
            equals: name.trim(), 
            mode: 'insensitive' 
          },
          id: { not: id }
        }
      });

      if (duplicateName) {
        return res.status(409).json({ 
          success: false, 
          message: 'Produk dengan nama ini sudah ada.' 
        });
      }
    }

    // Validasi SKU jika diubah
    if (sku && sku.trim() !== existing.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: { 
          sku: sku.trim(),
          id: { not: id }
        }
      });

      if (duplicateSku) {
        return res.status(409).json({ 
          success: false, 
          message: 'SKU produk sudah digunakan.' 
        });
      }
    }

    // Validasi angka negatif
    if (price !== undefined && price < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harga tidak boleh negatif.' 
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stok tidak boleh negatif.' 
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(sku && { sku: sku.trim() }),
        ...(category && { category: category.trim() }),
        ...(type && { type: type.trim() }),
        ...(unit && { unit: unit.trim() }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock })
      },
    });

    res.json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi produk ada
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    // Cek apakah sudah dihapus
    if (existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Produk sudah dihapus sebelumnya.' 
      });
    }

    // Soft delete: set deletedAt ke sekarang
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Produk berhasil dihapus dan dipindahkan ke arsip.',
    });
  } catch (error) {
    next(error);
  }
});

// Get archived (deleted) products
router.get('/archived/list', authenticate, async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ 
      where: { 
        deletedAt: { not: null } 
      },
      orderBy: { deletedAt: 'desc' } 
    });
    res.json({
      success: true,
      message: 'Daftar produk arsip berhasil diambil.',
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

// Restore deleted product
router.post('/:id/restore', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi produk ada
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    // Cek apakah produk memang sudah dihapus
    if (!existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Produk tidak dalam status arsip.' 
      });
    }

    // Restore: set deletedAt ke null
    const restored = await prisma.product.update({
      where: { id },
      data: { deletedAt: null }
    });

    res.json({
      success: true,
      message: 'Produk berhasil dikembalikan dari arsip.',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
});

export default router;