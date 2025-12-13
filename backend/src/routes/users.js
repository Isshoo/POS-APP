import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Daftar pengguna berhasil diambil.',
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/last-login', authenticate, async (_req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { lastLoginAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tidak ada data login.' 
      });
    }

    res.json({
      success: true,
      message: 'Data login terakhir berhasil diambil.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input wajib
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama, email, dan kata sandi wajib diisi.' 
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Format email tidak valid.' 
      });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kata sandi harus minimal 6 karakter.' 
      });
    }

    // Validasi role
    const validRoles = ['admin', 'user', 'manager'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Role tidak valid. Pilihan: ${validRoles.join(', ')}.` 
      });
    }

    // Validasi email sudah terdaftar
    const existing = await prisma.user.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email sudah terdaftar.' 
      });
    }

    const existingByName = await prisma.user.findFirst({
      where: { name: name.trim() }
    });

    if (existingByName) {
      return res.status(409).json({ 
        success: false, 
        message: 'Nama pengguna sudah digunakan.' 
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hash,
        role: role || 'admin',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Akun pengguna berhasil dibuat.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Validasi user ada
    const existing = await prisma.user.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pengguna tidak ditemukan.' 
      });
    }

    // Validasi email jika diubah
    if (email && email.trim().toLowerCase() !== existing.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Format email tidak valid.' 
        });
      }

      const duplicateEmail = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      });

      if (duplicateEmail) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email sudah terdaftar.' 
        });
      }
    }

    // Validasi password jika diubah
    if (password && password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kata sandi harus minimal 6 karakter.' 
      });
    }

    // Validasi role
    const validRoles = ['admin', 'user', 'manager'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Role tidak valid. Pilihan: ${validRoles.join(', ')}.` 
      });
    }

    // Cegah mengubah role sendiri jika user adalah satu-satunya admin
    if (role && role !== existing.role && req.user.sub === id) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      });

      if (adminCount === 1 && existing.role === 'admin') {
        return res.status(409).json({ 
          success: false, 
          message: 'Tidak dapat mengubah role. Anda adalah satu-satunya admin.' 
        });
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(role && { role }),
    };

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi user ada
    const existing = await prisma.user.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pengguna tidak ditemukan.' 
      });
    }

    // Cegah menghapus diri sendiri
    if (req.user.sub === id) {
      return res.status(409).json({ 
        success: false, 
        message: 'Tidak dapat menghapus akun sendiri.' 
      });
    }

    // Cegah menghapus admin terakhir
    if (existing.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      });

      if (adminCount === 1) {
        return res.status(409).json({ 
          success: false, 
          message: 'Tidak dapat menghapus admin terakhir.' 
        });
      }
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Pengguna berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;