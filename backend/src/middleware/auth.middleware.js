const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { AppError } = require('./error.middleware');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token de autenticación requerido.', 401));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new AppError('Token inválido o expirado.', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return next(new AppError('Usuario no autorizado.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('No tenés permiso para realizar esta acción.', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
