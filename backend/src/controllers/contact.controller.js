const { body } = require('express-validator');
const prisma = require('../utils/prisma');
const { AppError } = require('../middleware/error.middleware');

const contactValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('subject').trim().notEmpty().withMessage('El asunto es requerido.').isLength({ max: 200 }),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('El mensaje es requerido.')
    .isLength({ min: 10, max: 2000 })
    .withMessage('El mensaje debe tener entre 10 y 2000 caracteres.'),
];

const sendMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: '¡Mensaje enviado correctamente! Te contactaremos a la brevedad.',
      data: { id: contact.id },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────
const getAllMessages = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    const where = {};
    if (isRead === 'true') where.isRead = true;
    if (isRead === 'false') where.isRead = false;

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });

    res.json({ success: true, data: messages, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Mensaje eliminado.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { contactValidators, sendMessage, getAllMessages, markAsRead, deleteMessage };
