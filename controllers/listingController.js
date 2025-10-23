const Listing = require('../models/Listing');
const User = require('../models/User');

const createListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

  const imageUrls = req.files['images']?.map(file => file.path) || [];
  const videoUrl = req.files['video']?.[0]?.path || null;

    
    const {
      name,
      description,
      price,
      subPrice,
      location,
      features,
      seller,
      userName,
      phoneNumber,
      estimatedTime, 
    } = req.body;

    const newListing = new Listing({
      name,
      description,
      price,
      subPrice,
      location,
      images: imageUrls,
      video: videoUrl, 
      features,
      seller,
      school: user.school,
      userId: user._id,
      userName,
      phoneNumber: user.phoneNumber,
      estimatedTime,
    });


    const savedListing = await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: savedListing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create listing' });
  }
};



const getListings = async (req, res) => {
  try {
    let listings;
    console.log('backend hit')
    // If user is logged in, show listings from their school
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      listings = await Listing.find({ school: user.school });
    } else {
      // If user is not logged in, show all listings (public)
      listings = await Listing.find();
    }
    console.log(listings)
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
};


// 🆕 Delete a listing
const deleteListing = async (req, res) => {

  try {

    const userId = req.user.id;
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // only allow the owner to delete
    if (listing.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await listing.deleteOne();

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete listing', error: error.message });
  }
};



module.exports = {
  createListing,
  getListings,
  deleteListing,
};
