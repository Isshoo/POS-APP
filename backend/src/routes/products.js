import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get next auto-generated SKU
router.get('/next-sku', authenticate, async (_req, res, next) => {
  try {
    // Find the highest existing SKU number
    const products = await prisma.product.findMany({
      where: {
        sku: { startsWith: 'PRD' }
      },
      select: { sku: true }
    });
    
    let maxNumber = 0;
    for (const product of products) {
      const match = product.sku.match(/^PRD(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    
    // Also count products that don't have PRD format to include them
    const totalProducts = await prisma.product.count();
    const nextNumber = Math.max(maxNumber + 1, totalProducts + 1);
    const sku = `PRD${String(nextNumber).padStart(4, '0')}`;
    
    res.json({
      success: true,
      data: { sku },
    });
  } catch (error) {
    next(error);
  }
});

// Regenerate all SKUs with new format
router.post('/regenerate-sku', authenticate, async (_req, res, next) => {
  try {
    // Get all products ordered by creation date
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    // Update each product with new sequential SKU
    for (let i = 0; i < products.length; i++) {
      const newSku = `PRD${String(i + 1).padStart(4, '0')}`;
      await prisma.product.update({
        where: { id: products[i].id },
        data: { sku: newSku }
      });
    }
    
    res.json({
      success: true,
      message: `${products.length} produk berhasil diperbarui dengan SKU baru.`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { unit: true, category: true }
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
    const { name, sku, price, costPrice, stock, categoryId, type, unitId } = req.body;

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
        message: 'Harga jual tidak boleh negatif.' 
      });
    }

    if (costPrice && costPrice < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harga beli tidak boleh negatif.' 
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
        categoryId: categoryId || null,
        type: type?.trim() || '',
        unitId: unitId || null,
        costPrice: costPrice || 0,
        price: price || 0,
        stock: stock || 0,
      },
      include: { unit: true, category: true }
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
    const { name, sku, price, costPrice, stock, categoryId, type, unitId } = req.body;

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
        message: 'Harga jual tidak boleh negatif.' 
      });
    }

    if (costPrice !== undefined && costPrice < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Harga beli tidak boleh negatif.' 
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
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(type && { type: type.trim() }),
        ...(unitId !== undefined && { unitId: unitId || null }),
        ...(costPrice !== undefined && { costPrice }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock })
      },
      include: { unit: true, category: true }
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

    // Hard delete: hapus permanen dari database
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Produk berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;