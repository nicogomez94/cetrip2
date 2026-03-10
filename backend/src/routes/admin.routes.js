const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');

const sections = require('../controllers/sections.controller');
const blocks = require('../controllers/blocks.controller');
const contact = require('../controllers/contact.controller');
const { uploadImage } = require('../controllers/upload.controller');

// Todas las rutas admin requieren autenticación
router.use(authenticate);

// ─── Secciones ────────────────────────────────────────────────────────────────
router.get('/sections', sections.getAll);
router.get('/sections/:id', sections.getOne);
router.post('/sections', sections.create);
router.put('/sections/:id', sections.update);
router.patch('/sections/:id/toggle', sections.toggle);
router.patch('/sections/reorder', sections.reorder);
router.delete('/sections/:id', sections.remove);

// ─── Bloques ─────────────────────────────────────────────────────────────────
router.get('/blocks', blocks.getAll);
router.get('/blocks/:id', blocks.getOne);
router.post('/blocks', blocks.create);
router.put('/blocks/:id', blocks.update);
router.patch('/blocks/:id/toggle', blocks.toggle);
router.patch('/blocks/reorder', blocks.reorder);
router.delete('/blocks/:id', blocks.remove);

// ─── Mensajes de contacto ─────────────────────────────────────────────────────
router.get('/messages', contact.getAllMessages);
router.patch('/messages/:id/read', contact.markAsRead);
router.delete('/messages/:id', contact.deleteMessage);

// ─── Uploads ──────────────────────────────────────────────────────────────────
router.post('/upload', uploadImage);

module.exports = router;
