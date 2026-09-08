// server/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Chanda = require('../models/Chanda');
const Expense = require('../models/Expense');
const Video = require('../models/Video');
const DailyEvent = require('../models/DailyEvent');
const { displayValue } = require('../utils/otherField');

// GET /api/public/:slug -> basic temple info for the public page header
router.get('/:slug', async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug }).select('name slug logoUrl backgroundUrl');
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

    const filter = { organization: org._id };
    if (req.query.year) {
      const year = Number(req.query.year);
      filter.date = { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) };
    }

    const [chandas, expenses, events] = await Promise.all([
      Chanda.find(filter),
      Expense.find(filter),
      DailyEvent.find(filter),
    ]);

    const totalChanda = chandas.reduce((sum, c) => sum + c.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalEventBudget = events.reduce((sum, ev) => sum + (ev.budget || 0), 0);

    res.json({
      totalChanda,
      totalExpense,
      totalEventBudget,
      balance: totalChanda - totalExpense - totalEventBudget,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});
// GET /api/public/:slug/videos?year=2026
router.get('/:slug/videos', async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug }).select('name slug logoUrl backgroundUrl');
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

// GET /api/public/:slug/daily-events?year=2026
router.get('/:slug/daily-events', async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org) {
      return res.status(404).json({ message: 'Temple not found' });
    }

    const filter = { organization: org._id };
    if (req.query.year) {
      const year = Number(req.query.year);
      filter.date = { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) };
    }

    const events = await DailyEvent.find(filter).sort({ date: -1 }).select('-notes');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

module.exports = router;