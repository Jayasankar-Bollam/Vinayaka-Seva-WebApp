// server/controllers/authController.js
const User = require('../models/User');
const Organization = require('../models/Organization');
const slugify = require('../utils/slugify');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


async function register(req, res) {
  try {
    const { name, email, password, orgName } = req.body;

    if (!name || !email || !password || !orgName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate a unique slug — if "sri-venkateswara-trust" exists, try "-1", "-2", etc.
    let baseSlug = slugify(orgName);
    let slug = baseSlug;
    let suffix = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

  const organization = await Organization.create({
  name: orgName,
  slug,
  logoUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
});

    const user = await User.create({
      name,
      email,
      password, // gets hashed automatically by the pre-save hook you wrote
      organization: organization._id,
      role: 'org-admin',
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email },
      organization: { id: organization._id, name: organization.name, slug: organization.slug },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

async function updateLogo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      { logoUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json({ message: 'Logo updated', organization });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update logo', error: err.message });
  }
}

async function updateBackground(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      { backgroundUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json({ message: 'Background updated', organization });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update background', error: err.message });
  }
}


async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way, whether or not the user exists —
    // otherwise an attacker could use this endpoint to discover valid emails
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password — Vinayaka Seva',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process request', error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password; // will be re-hashed automatically by the pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const organization = await Organization.findById(user.organization); // fetch it

    const token = jwt.sign(
      { userId: user._id, organization: user.organization, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
  token,
  user: { id: user._id, name: user.name, email: user.email, role: user.role },
  organization: {
    id: organization._id,
    name: organization.name,
    slug: organization.slug,
    logoUrl: organization.logoUrl, // add this
  },
});
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

module.exports = { register, login, forgotPassword, resetPassword, updateLogo, updateBackground };