// server/controllers/overviewController.js
const Chanda = require('../models/Chanda');
const Expense = require('../models/Expense');
const DailyEvent = require('../models/DailyEvent');

async function getOverview(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const orgFilter = { organization: req.user.organization, date: { $gte: start, $lt: end } };

    const [chandas, expenses, events] = await Promise.all([
      Chanda.find(orgFilter),
      Expense.find(orgFilter),
      DailyEvent.find(orgFilter),
    ]);

    const totalChanda = chandas.reduce((sum, c) => sum + c.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalEventBudget = events.reduce((sum, ev) => sum + (ev.budget || 0), 0);
    const netBalance = totalChanda - totalExpense - totalEventBudget;

    // Month-by-month breakdown, for a chart
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      chanda: 0,
      expense: 0,
    }));
    chandas.forEach((c) => {
      monthly[new Date(c.date).getMonth()].chanda += c.amount;
    });
    expenses.forEach((e) => {
      monthly[new Date(e.date).getMonth()].expense += e.amount;
    });

    res.json({
      year,
      totalChanda,
      totalExpense,
      totalEventBudget,
      netBalance,
      chandaCount: chandas.length,
      expenseCount: expenses.length,
      eventCount: events.length,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch overview', error: err.message });
  }
}

module.exports = { getOverview };