import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all categories
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({
      success: true,
      message: 'Daftar kategori berhasil diambil.',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// Create new category
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi.'
      });
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Kategori dengan nama ini sudah ada.'
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kategori baru berhasil ditambahkan.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// Delete category (only if not used by any product)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.'
      });
    }

    // Check if category is used by any product
    const productsUsingCategory = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${productsUsingCategory} produk.`
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
