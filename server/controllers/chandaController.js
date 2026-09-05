// server/controllers/chandaController.js
const Chanda = require('../models/Chanda');

async function createChanda(req, res) {
  try {
    const chanda = await Chanda.create({
      ...req.body,
      organization: req.user.organization, // always from the token, never from the client
    });
    res.status(201).json(chanda);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create chanda entry', error: err.message });
  }
}

async function getChandas(req, res) {
  try {
    const { search, year, month } = req.query;
    const filter = { organization: req.user.organization }; // always scoped to this org

    if (search) {
      filter.devoteeName = { $regex: search, $options: 'i' }; // case-insensitive partial match
    }

    if (year) {
      const start = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
      const end = month ? new Date(Number(year), Number(month), 1) : new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const chandas = await Chanda.find(filter).sort({ date: -1 });
    res.json(chandas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chanda entries', error: err.message });
  }
}




async function updateChanda(req, res) {
  try {
    const chanda = await Chanda.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization }, // scoped — can't touch another org's data
      req.body,
      { new: true, runValidators: true }
    );

    if (!chanda) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(chanda);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update chanda entry', error: err.message });
  }
}

async function deleteChanda(req, res) {
  try {
    const chanda = await Chanda.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!chanda) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chanda entry', error: err.message });
  }
}

module.exports = { createChanda, getChandas, updateChanda, deleteChanda };


