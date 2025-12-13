import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const [productCount, todayTransactions, lastTransactions] = await Promise.all([
      prisma.product.count(),
      prisma.transaction.aggregate({
        _sum: { totalPayment: true },
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      message: 'Ringkasan dashboard berhasil diambil.',
      data: {
        totalProducts: productCount,
        todaySales: todayTransactions._sum.totalPayment || 0,
        latestTransactions: lastTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


