import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const computeRange = (days) => {
  const from = new Date();
  from.setDate(from.getDate() - days);
  return from;
};

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const [daily, weekly, monthly, yearly] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { totalPayment: true, profit: true },
        where: { createdAt: { gte: computeRange(1) } },
      }),
      prisma.transaction.aggregate({
        _sum: { totalPayment: true, profit: true },
        where: { createdAt: { gte: computeRange(7) } },
      }),
      prisma.transaction.aggregate({
        _sum: { totalPayment: true, profit: true },
        where: { createdAt: { gte: computeRange(30) } },
      }),
      prisma.transaction.aggregate({
        _sum: { totalPayment: true, profit: true },
        where: { createdAt: { gte: computeRange(365) } },
      }),
    ]);

    res.json({
      success: true,
      message: 'Laporan penjualan berhasil diambil.',
      data: {
        daily,
        weekly,
        monthly,
        yearly,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


