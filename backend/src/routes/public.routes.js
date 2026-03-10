const router = require('express').Router();
const { getByPage } = require('../controllers/sections.controller');
const { sendMessage, contactValidators } = require('../controllers/contact.controller');
const validate = require('../middleware/validate.middleware');

// Secciones públicas por página
router.get('/sections/:page', getByPage);

// Formulario de contacto
router.post('/contact', contactValidators, validate, sendMessage);

module.exports = router;
