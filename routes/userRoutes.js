/**
 * userRoutes.js
 * ----------------------------
 * This file defines all user-related routes for the application.
 * It handles requests like user registration, login, profile fetch,
 * update, and deletion. Each route is linked to its respective 
 * controller logic.
 *
 * Example Routes:
 *  - GET    /api/users         -> Fetch all users
 *  - POST   /api/users         -> Register a new user
 *  - POST   /api/users/login   -> Log in a user
 *  - GET    /api/users/:id     -> Get user by ID
 *  - PUT    /api/users/:id     -> Update user details
 *  - DELETE /api/users/:id     -> Delete a user
 *
 * Mounted in server.js as: app.use('/api/users', userRoutes)
 */

const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');
const { signInUser } = require('../controllers/authController');
const {  forgotPassword, resetPassword } = require('../controllers/authController');




// Test route
router.get('/', (req, res) => {
  res.send('User route working!');
});
router.post('/signin', signInUser);

// Signup route
router.post('/signup', registerUser);


// 🔐 Forgot Password (send reset link)
router.post('/forgot-password', forgotPassword);

// 🔐 Reset Password (submit new password)
router.post('/reset-password', resetPassword);

module.exports = router;
