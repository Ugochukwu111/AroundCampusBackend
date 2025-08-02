const express = require('express');
const router = express.Router();
const { getListings, createListing } = require('../controllers/listingController');
const { verifyToken } = require('../middleware/authMiddleware'); 
const multer = require('multer');
const { upload } = require('../utils/cloudinary');



router.post('/', verifyToken, upload.array('images'), createListing);

// Get all listings (filtered by user’s school)
router.get('/', verifyToken, getListings);

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private

module.exports = router;