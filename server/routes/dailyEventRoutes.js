// server/routes/dailyEventRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createDailyEvent, getDailyEvents, updateDailyEvent, deleteDailyEvent } = require('../controllers/dailyEventController');

router.post('/', requireAuth, createDailyEvent);
router.get('/', requireAuth, getDailyEvents);
router.put('/:id', requireAuth, updateDailyEvent);
router.delete('/:id', requireAuth, deleteDailyEvent);

module.exports = router;