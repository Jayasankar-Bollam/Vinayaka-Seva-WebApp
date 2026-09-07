// server/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Chanda = require('../models/Chanda');
const Expense = require('../models/Expense');
const Video = require('../models/Video');

// GET /api/public/:slug -> basic temple info for the public page header
router.get('/:slug', async (req, res) => {
  try {
const org = await Organization.findOne({ slug: req.params.slug }).select('name slug logoUrl');
    if (!org) {
      return res.status(404).json({ message: 'Temple not found' });
    }
    res.json(org);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch temple info', error: err.message });
  }
});

// GET /api/public/:slug/summary?year=2026
router.get('/:slug/summary', async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const [chandas, expenses] = await Promise.all([
      Chanda.find({ organization: org._id, date: { $gte: start, $lt: end } }),
      Expense.find({ organization: org._id, date: { $gte: start, $lt: end } }),
    ]);

    const totalChanda = chandas.reduce((sum, c) => sum + c.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      year,
      totalChanda,
      totalExpense,
      balance: totalChanda - totalExpense,
      VideoPage,
      DailyEventPage,
      
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});

// GET /api/public/:slug/videos?year=2026
router.get('/:slug/videos', async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    const filter = { organization: org._id };
    if (req.query.year) {
      filter.year = Number(req.query.year);
    }

    const videos = await Video.find(filter).sort({ year: -1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});
module.exports = router;