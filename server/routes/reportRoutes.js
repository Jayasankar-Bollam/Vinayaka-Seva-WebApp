const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { chandaReport, expenseReport, dailyEventReport } = require('../controllers/reportController');


router.use(requireAuth);

router.get('/chanda', chandaReport);
router.get('/expense', expenseReport);
router.get('/daily-events', dailyEventReport);

module.exports = router;