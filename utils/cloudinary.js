const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Combined storage for images and videos
const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'around-campus/media', // all media goes here
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'],
    resource_type: 'auto', // allows both images & videos
  },
});

// Single Multer upload instance
const upload = multer({ storage: combinedStorage });

module.exports = { cloudinary, upload };