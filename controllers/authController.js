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
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc   Authenticate user & get token
// @route  POST /api/users/signin
// @access Public
const signInUser = async (req, res) => {
  try {
    console.log('📩 Received sign-in data:', req.body);
    
    const { email, password } = req.body;

    // Log type and length of password
    console.log('🔐 Input password (raw):', password);
    console.log('🧪 Type of password:', typeof password);
    console.log('📏 Length of password:', password.length);

    if (!email || !password) {
      console.log('⚠️ Missing email or password');
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const user = await User.findOne({ email });
    console.log('👤 User found:', user);

    if (!user) {
      console.log('❌ No user with that email.');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('🧂 Hashed password in DB:', user.password);
    console.log('🧮 Type of stored password:', typeof user.password);
    console.log('📏 Length of hashed password:', user.password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('✅ Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match.');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🎫 JWT token generated:', token);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id, // Make sure front end expects `_id`
        fullName: user.fullName,
        email: user.email,
        school: user.school,
      }
    });

  } catch (error) {
    console.error('💥 Signin error:', error);
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
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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

    console.log('✅ Reset email sent:', info.messageId);

    return res
      .status(200)
      .json({ message: 'Reset link sent. Check your email inbox.' });
  } catch (error) {
    console.error('💥 Forgot Password error:', error);
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

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    delete resetTokens[token];

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = {
  registerUser,
  signInUser,
  forgotPassword,
  resetPassword,
};
