// server/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');

router.post('/', requireAuth, upload.single('receipt'), createExpense);
router.get('/', requireAuth, getExpenses);
router.put('/:id', requireAuth, upload.single('receipt'), updateExpense);
router.delete('/:id', requireAuth, deleteExpense);

module.exports = router;