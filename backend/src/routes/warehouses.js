import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all warehouse entries
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const entries = await prisma.warehouse.findMany({
      orderBy: { date: 'desc' },
    });
    res.json({
      success: true,
      message: 'Data gudang berhasil diambil.',
      data: entries,
    });
  } catch (error) {
    next(error);
  }
});

// Create new warehouse entry
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productName, type, quantity, date, notes } = req.body;

    // Validate required fields
    if (!productName || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nama produk, tipe, dan jumlah wajib diisi.',
      });
    }

    // Validate type
    if (!['masuk', 'keluar'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe harus "masuk" atau "keluar".',
      });
    }

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah harus berupa bilangan bulat positif.',
      });
    }

    const entry = await prisma.warehouse.create({
      data: {
        productName,
        type,
        quantity,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: `Barang ${type} berhasil dicatat.`,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

// Update warehouse entry
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productName, type, quantity, date, notes } = req.body;

    const existing = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data gudang tidak ditemukan.',
      });
    }

    // Validate type if provided
    if (type && !['masuk', 'keluar'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe harus "masuk" atau "keluar".',
      });
    }

    // Validate quantity if provided
    if (quantity !== undefined && (quantity <= 0 || !Number.isInteger(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah harus berupa bilangan bulat positif.',
      });
    }

    const updated = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(productName && { productName }),
        ...(type && { type }),
        ...(quantity !== undefined && { quantity }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    res.json({
      success: true,
      message: 'Data gudang berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Hard delete warehouse entry
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data gudang tidak ditemukan.',
      });
    }

    // Hard delete: hapus permanen dari database
    await prisma.warehouse.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Data gudang berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
