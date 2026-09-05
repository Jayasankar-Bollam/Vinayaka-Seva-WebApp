// server/models/Chanda.js
const mongoose = require("mongoose");
const { otherField } = require('../utils/otherField');

const chandaSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    devoteeName: { type: String, required: true, trim: true },
    devoteePhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true; // optional — empty is fine
          return /^[6-9]\d{9}$/.test(value); // exactly 10 digits, starting 6-9 (valid Indian mobile pattern)
        },
        message: "Phone number must be a valid 10-digit number",
      },
    },
    amount: { type: Number, required: true, min: 0 },
    date: {
  type: Date,
  required: true,
  default: Date.now,
  validate: {
    validator: function (value) {
      const year = value.getFullYear();
      return year >= 2000 && year <= 2100;
    },
    message: 'Date must be within a reasonable range',
  },
},
    // chandaType: otherField(["Monthly", "Yearly", "One-time", "Festival"]),
    paymentMode: otherField(["Cash", "PhonePe", "GPay", "Bank Transfer"]),
    notes: { type: String, trim: true },
  },
  
  { timestamps: true },
  
);

chandaSchema.index({ organization: 1, date: -1 });

module.exports = mongoose.model("Chanda", chandaSchema);
