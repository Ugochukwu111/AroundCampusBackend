const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  location: String,
  images: { type: [String], required: true },
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


module.exports = mongoose.model('Listing', listingSchema);