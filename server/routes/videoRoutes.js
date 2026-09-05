// server/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createVideo, getVideos, updateVideo, deleteVideo } = require('../controllers/videoController');

router.post('/', requireAuth, createVideo);
router.get('/', requireAuth, getVideos);
router.put('/:id', requireAuth, updateVideo);
router.delete('/:id', requireAuth, deleteVideo);

module.exports = router;