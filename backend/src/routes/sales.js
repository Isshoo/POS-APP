import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const sales = await prisma.salesPerson.findMany({ 
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' } 
    });
    res.json({
      success: true,
      message: 'Daftar sales berhasil diambil.',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    // Validasi input wajib
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama sales wajib diisi.' 
      });
    }

    // Validasi nama sales sudah ada
    const existingByName = await prisma.salesPerson.findFirst({
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
        message: 'Sales dengan nama ini sudah ada.' 
      });
    }

    // Validasi nomor telepon jika ada
    if (phone) {
      const existingByPhone = await prisma.salesPerson.findFirst({
        where: { phone: phone.trim() }
      });

      if (existingByPhone) {
        return res.status(409).json({ 
          success: false, 
          message: 'Nomor telepon sudah terdaftar.' 
        });
      }

      // Validasi format nomor telepon (hanya angka dan karakter +-)
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Format nomor telepon tidak valid.' 
        });
      }
    }

    const sales = await prisma.salesPerson.create({ 
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Data sales berhasil ditambahkan.',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    // Validasi sales ada
    const existing = await prisma.salesPerson.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data sales tidak ditemukan.' 
      });
    }

    // Validasi nama jika diubah
    if (name && name.trim() !== existing.name) {
      const duplicateName = await prisma.salesPerson.findFirst({
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
          message: 'Sales dengan nama ini sudah ada.' 
        });
      }
    }

    // Validasi nomor telepon jika diubah
    if (phone && phone.trim() !== existing.phone) {
      const duplicatePhone = await prisma.salesPerson.findFirst({
        where: { 
          phone: phone.trim(),
          id: { not: id }
        }
      });

      if (duplicatePhone) {
        return res.status(409).json({ 
          success: false, 
          message: 'Nomor telepon sudah terdaftar.' 
        });
      }

      // Validasi format nomor telepon
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Format nomor telepon tidak valid.' 
        });
      }
    }

    const sales = await prisma.salesPerson.update({ 
      where: { id }, 
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
      }
    });

    res.json({
      success: true,
      message: 'Data sales berhasil diperbarui.',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi sales ada
    const existing = await prisma.salesPerson.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data sales tidak ditemukan.' 
      });
    }

    // Cek apakah sudah dihapus
    if (existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Sales sudah dihapus sebelumnya.' 
      });
    }

    // Soft delete: set deletedAt ke sekarang
    await prisma.salesPerson.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Data sales berhasil dihapus dan dipindahkan ke arsip.',
    });
  } catch (error) {
    next(error);
  }
});

// Get archived sales
router.get('/archived/list', authenticate, async (_req, res, next) => {
  try {
    const sales = await prisma.salesPerson.findMany({ 
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' } 
    });
    res.json({
      success: true,
      message: 'Daftar sales arsip berhasil diambil.',
      data: sales,
    });
  } catch (error) {
    next(error);
  }
});

// Restore archived sales
router.post('/:id/restore', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.salesPerson.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data sales tidak ditemukan.' 
      });
    }

    if (!existing.deletedAt) {
      return res.status(409).json({ 
        success: false, 
        message: 'Sales tidak dalam status arsip.' 
      });
    }

    const restored = await prisma.salesPerson.update({
      where: { id },
      data: { deletedAt: null }
    });

    res.json({
      success: true,
      message: 'Data sales berhasil dikembalikan dari arsip.',
      data: restored,
    });
  } catch (error) {
    next(error);
  }
});

export default router;