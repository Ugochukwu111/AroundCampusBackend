const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');         // 👈 import your User model
const Listing = require('./models/Listing'); 
dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

app.use(express.json()); // for parsing application/jsona



// cors
app.use(cors({
  origin: ['https://aroundcampus.ng','https://around-campus.vercel.app', 'http://127.0.0.1:5501'], // or your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.get('/', (req, res) => {
  res.send('Around Campus API is running...');
});



// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const listingRoutes = require('./routes/listingRoutes');
app.use('/api/listings', listingRoutes);
app.use('/api', require('./routes/contact'));

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();

    res.json({ totalUsers, totalListings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
