const Listing = require('../models/Listing');
const User = require('../models/User');

const createListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract uploaded image URLs from Cloudinary
    const imageUrls = req.files.map(file => file.path);

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
      features,
      seller,
      school: user.school,
      userId: user._id,
      userName,
      phoneNumber,
      estimatedTime,
    });

    const savedListing = await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: savedListing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};



const getListings = async (req, res) => {
  console.log("📥 [GET] /api/listings - Incoming request");

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      console.warn("⚠️ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const userSchool = user.school;
    console.log(`🏫 User's school: ${userSchool}`);

    const listings = await Listing.find({ school: userSchool });
    console.log(`✅ Listings fetched for ${userSchool}: ${listings.length} items`);

    res.status(200).json(listings);
  } catch (error) {
    console.error("❌ Error fetching listings:", error.message);
    res.status(500).json({ message: 'Failed to fetch listings', error: error.message });
  }
};



module.exports = {
  createListing,
  getListings,
};
