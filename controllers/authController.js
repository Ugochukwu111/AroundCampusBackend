const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const resetTokens = {}; // token: { userId, expires }
const nodemailer = require('nodemailer');
// @desc   Register new user
// @route  POST /api/users/signup
// @access Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, school, password, acceptedTerms } = req.body;

    if (!fullName || !email || !school || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

 

    const user = new User({
      fullName,
      email,
      school,
      password,
    });

    await user.save();

     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: '1h'
});

res.status(201).json({
  message: 'User registered successfully.',
  token,
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    userName: user.userName || '',
    image: user.image || '',
    isSeller: user.isSeller || false,
    phone: user.phone || '',
    school: user.school || '',
    createdAt: user.createdAt,
    posts: user.posts || [],
    saves: user.saves || []
  }
});

  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc   Authenticate user & get token
// @route  POST /api/users/signin
// @access Public
const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '14d' }
    );

   
const userWithoutPassword = user.toObject(); // Convert Mongoose doc to plain JS object
delete userWithoutPassword.password;         // Remove sensitive info

res.status(200).json({
  message: 'Login successful',
  token,
  user: userWithoutPassword,
});

  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};



//script for forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(404).json({ message: 'User not found' });

    // 2. Generate token & expiry
    const token   = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 15 * 60 * 1000; // 15 min
    resetTokens[token] = { userId: user._id, expires };

    // 3. Build reset link for your frontend
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    // 4. Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 5. Send the email
    const info = await transporter.sendMail({
      from:    `"Around Campus" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: '🔒 Reset Your Password',
      html: `
        <p>Hi ${user.fullName || ''},</p>
        <p>You requested a password reset. Click below to set a new password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link expires in 15 minutes.</p>
      `,
    });


    return res
      .status(200)
      .json({ message: 'Reset link sent. Check your email inbox.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error. Please try again later.' });
  }
};

// reset password scripts
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {

    const data = resetTokens[token];

    if (!data || data.expires < Date.now()) {
      return res.status(400).json({ message: 'Token is invalid or expired' });
    }

    const user = await User.findById(data.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Let the userSchema pre-save hook handle hashing
    user.password = newPassword;
    await user.save();

    delete resetTokens[token]; // Remove used token

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userName, fullName, phoneNumber } = req.body;
    const userId = req.user.id;

    // Check if username is taken by someone else
    if (userName) {
            const existingUser = await User.findOne({ userName });

        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, fullName, phoneNumber },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Profile updated', updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};





module.exports = {
  registerUser,
  signInUser,
  forgotPassword,
  resetPassword,
  updateUserProfile,
};
