import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dashboardRouter from './routes/dashboard.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';
import warehousesRouter from './routes/warehouses.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports', reportsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  // Prisma known errors (kode seperti P2002, P2025, dll)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada, melanggar batasan unik.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Data yang diminta tidak ditemukan.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
  });
});

export default app;


