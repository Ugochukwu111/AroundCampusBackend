const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  location: String,
  images: { type: [String], required: true },
  video: { type: String },
  features: [String],
  seller: String,
  school: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  estimatedTime: {
  type: String,
  required: true, 
},
  userName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
}, { timestamps: true });

listingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 });


module.exports = mongoose.model('Listing', listingSchema);