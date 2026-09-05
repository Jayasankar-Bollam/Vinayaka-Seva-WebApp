// server/models/Expense.js
const mongoose = require('mongoose');
const { otherField } = require('../utils/otherField');

const expenseSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    category: otherField(['Pooja Items', 'Lighting/Deepam', 'Flowers', 'Prasadam', 'Maintenance']),
    purpose: otherField(['Oil', 'Camphor', 'Flowers', 'Decoration', 'Electricity']),
    amount: { type: Number, required: true, min: 0 },
    paymentMode: otherField(['Cash', 'PhonePe', 'GPay', 'Bank Transfer']),
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ organization: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);