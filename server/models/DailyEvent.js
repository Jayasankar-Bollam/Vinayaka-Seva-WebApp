// server/models/DailyEvent.js
const mongoose = require('mongoose');
const { otherField } = require('../utils/otherField');

const dailyEventSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    eventType: otherField(['Deeparadhana', 'Mangala Harathi', 'Bajana', 'Tug of War', 'Kabaddi']),
    budget: { type: Number, min: 0 }, // optional — not every event has an associated cost
    description: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

dailyEventSchema.index({ organization: 1, date: -1 });

module.exports = mongoose.model('DailyEvent', dailyEventSchema);