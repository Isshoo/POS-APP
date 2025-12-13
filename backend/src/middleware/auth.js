import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};


