// server/controllers/videoController.js
const Video = require('../models/Video.js');

async function createVideo(req, res) {
  try {
    const video = await Video.create({
      ...req.body,
      organization: req.user.organization, // always from the token, never from the client
    });
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create video entry', error: err.message });
  }
}

async function getVideos(req, res) {
  try {
    const { year } = req.query;
    const filter = { organization: req.user.organization };

    if (year) {
      filter.year = Number(year); // Video.year is a plain number, not a date range
    }

    const videos = await Video.find(filter).sort({ year: -1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
}

async function updateVideo(req, res) {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      req.body,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(video);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update video', error: err.message });
  }
}

async function deleteVideo(req, res) {
  try {
    const video = await Video.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
    });

    if (!video) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete video', error: err.message });
  }
}

module.exports = { createVideo, getVideos, updateVideo, deleteVideo };