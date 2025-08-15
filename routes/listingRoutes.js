const express = require('express');
const router = express.Router();
const { getListings, createListing } = require('../controllers/listingController');
const { verifyToken } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

// Use single Multer instance for images + video
const uploadListingFiles = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'video', maxCount: 1 }
]);

// Create listing
router.post('/', verifyToken, uploadListingFiles, createListing);

// Get listings
router.get('/', verifyToken, getListings);

module.exports = router;