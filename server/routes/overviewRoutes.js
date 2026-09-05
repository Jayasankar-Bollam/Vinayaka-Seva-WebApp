const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getOverview } = require('../controllers/overviewController');

router.get('/', requireAuth, getOverview);

module.exports = router;