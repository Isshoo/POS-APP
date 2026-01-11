import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all units
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({
      success: true,
      message: 'Daftar satuan berhasil diambil.',
      data: units,
    });
  } catch (error) {
    next(error);
  }
});

// Create new unit
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama satuan wajib diisi.'
      });
    }

    // Check if unit already exists
    const existing = await prisma.unit.findFirst({
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
        message: 'Satuan dengan nama ini sudah ada.'
      });
    }

    const unit = await prisma.unit.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Satuan baru berhasil ditambahkan.',
      data: unit,
    });
  } catch (error) {
    next(error);
  }
});

// Delete unit (only if not used by any product)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if unit exists
    const unit = await prisma.unit.findUnique({
      where: { id }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Satuan tidak ditemukan.'
      });
    }

    // Check if unit is used by any product
    const productsUsingUnit = await prisma.product.count({
      where: { unitId: id }
    });

    if (productsUsingUnit > 0) {
      return res.status(400).json({
        success: false,
        message: `Satuan tidak dapat dihapus karena masih digunakan oleh ${productsUsingUnit} produk.`
      });
    }

    await prisma.unit.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Satuan berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
