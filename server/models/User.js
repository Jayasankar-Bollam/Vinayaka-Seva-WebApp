// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function (value) {
          // At least one uppercase, one lowercase, one number, one special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(value);
        },
        message: 'Password must include uppercase, lowercase, a number, and a special character',
      },
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: { type: String, enum: ['org-admin', 'staff'], default: 'org-admin' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// // Runs automatically right before .save() is called on a User document
// userSchema.pre('save', async function (next) {
//   // Only re-hash the password if it's new or was changed
//   // (important later — otherwise every profile update would re-hash an already-hashed password)
//   if (!this.isModified('password')) return next();

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// server/models/User.js — update the pre-save hook to this:
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method — lets us do user.comparePassword('typed-password') during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);