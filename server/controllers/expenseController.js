// server/controllers/expenseController.js
const Expense = require('../models/Expense');

async function createExpense(req, res) {
   console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const expense = await Expense.create({
      amount: req.body.amount,
      date: req.body.date,
      category: JSON.parse(req.body.category),
      // purpose: JSON.parse(req.body.purpose),
      paymentMode: JSON.parse(req.body.paymentMode),
      notes: req.body.notes,
      organization: req.user.organization,
      receiptUrl: req.file ? req.file.path : undefined,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create expense', error: err.message });
  }
}



async function getExpenses(req, res) {
  try {
    const { year, month } = req.query;
    const filter = { organization: req.user.organization };

    if (year) {
      const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
      const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
  }
}

async function updateExpense(req, res) {
  try {
    const updateData = {
      amount: req.body.amount,
      date: req.body.date,
      category: JSON.parse(req.body.category),
      // purpose: JSON.parse(req.body.purpose),
      paymentMode: JSON.parse(req.body.paymentMode),
      notes: req.body.notes,
    };

    if (req.file) {
      updateData.receiptUrl = req.file.path; // only overwrite if a new receipt was uploaded
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update expense', error: err.message });
  }
}

async function deleteExpense(req, res) {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense', error: err.message });
  }
}

module.exports = { createExpense, getExpenses, updateExpense, deleteExpense };