// server/models/Video.js
const mongoose = require('mongoose');
const { otherField } = require('../utils/otherField');

const videoSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },// link — never store raw video files
    year: { type: Number, required: true },
    category: otherField(['Festival', 'Daily Ritual', 'Special Event']),
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

videoSchema.index({ organization: 1, year: -1 });

module.exports = mongoose.model('Video', videoSchema);