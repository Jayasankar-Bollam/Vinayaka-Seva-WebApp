// server/controllers/dailyEventController.js
const DailyEvent = require('../models/DailyEvent');

async function createDailyEvent(req, res) {
  try {
    const event = await DailyEvent.create({
      ...req.body,
      organization: req.user.organization, // always from the token, never the client
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create daily event', error: err.message });
  }
}

async function getDailyEvents(req, res) {
  try {
    const { year, month } = req.query;
    const filter = { organization: req.user.organization };

    if (year) {
      const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
      const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const events = await DailyEvent.find(filter).sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily events', error: err.message });
  }
}

async function updateDailyEvent(req, res) {
  try {
    const event = await DailyEvent.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update daily event', error: err.message });
  }
}

async function deleteDailyEvent(req, res) {
  try {
    const event = await DailyEvent.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!event) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete daily event', error: err.message });
  }
}

module.exports = { createDailyEvent, getDailyEvents, updateDailyEvent, deleteDailyEvent };