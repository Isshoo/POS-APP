import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all active warehouse entries
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const entries = await prisma.warehouse.findMany({
      where: { deletedAt: null },
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

    if (existing.deletedAt) {
      return res.status(409).json({
        success: false,
        message: 'Data gudang sudah diarsipkan.',
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

// Soft delete warehouse entry
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

    if (existing.deletedAt) {
      return res.status(409).json({
        success: false,
        message: 'Data gudang sudah diarsipkan sebelumnya.',
      });
    }

    await prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Data gudang berhasil dipindahkan ke arsip.',
    });
  } catch (error) {
    next(error);
  }
});

// Get archived warehouse entries
router.get('/archived/list', authenticate, async (_req, res, next) => {
  try {
    const entries = await prisma.warehouse.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    res.json({
      success: true,
      message: 'Data gudang arsip berhasil diambil.',
      data: entries,
    });
  } catch (error) {
    next(error);
  }
});

// Restore archived warehouse entry
router.post('/:id/restore', authenticate, async (req, res, next) => {
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

    if (!existing.deletedAt) {
      return res.status(409).json({
        success: false,
        message: 'Data gudang tidak dalam status arsip.',
      });
    }

    const restored = await prisma.warehouse.update({
      where: { id },
      data: { deletedAt: null },
    });

    res.json({
      success: true,
      message: 'Data gudang berhasil dikembalikan dari arsip.',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
