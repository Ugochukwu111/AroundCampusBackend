const User = require('../models/User');
const bcrypt = require('bcrypt');

// @desc   Register new user
// @route  POST /api/users/signup
// @access Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, school, password, acceptedTerms } = req.body;

    // Basic validation
    if (!fullName || !email || !school || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      email,
      school,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { registerUser };

