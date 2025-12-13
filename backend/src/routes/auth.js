import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan kata sandi wajib diisi.' 
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

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau kata sandi salah.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau kata sandi salah.' 
      });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'dev-secret', 
      { expiresIn: '8h' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        accessToken: token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.sub } 
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pengguna tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      message: 'Data pengguna berhasil diambil.',
      data: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;