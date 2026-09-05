// server/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');

router.post('/', requireAuth, createExpense);
router.get('/', requireAuth, getExpenses);
router.put('/:id', requireAuth, updateExpense);
router.delete('/:id', requireAuth, deleteExpense);

module.exports = router;