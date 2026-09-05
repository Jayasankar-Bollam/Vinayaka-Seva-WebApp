// server/routes/chandaRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createChanda, getChandas, updateChanda, deleteChanda } = require('../controllers/chandaController');

router.post('/', requireAuth, createChanda);

router.get('/', requireAuth, getChandas);

router.put('/:id', requireAuth, updateChanda);
router.delete('/:id', requireAuth, deleteChanda);


module.exports = router;