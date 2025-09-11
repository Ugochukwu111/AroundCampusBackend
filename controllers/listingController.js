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
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.warn("⚠️ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const userSchool = user.school;
    const listings = await Listing.find({ school: userSchool });

    res.status(200).json(listings);
  } catch (error) {
    console.error("❌ Error fetching listings:", error.message);
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete listing', error: error.message });
  }
};



module.exports = {
  createListing,
  getListings,
  deleteListing,
};
