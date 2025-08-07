const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

app.use(express.json()); // for parsing application/jsona



// cors
app.use(cors({
  origin: ['https://aroundcampus.ng','https://around-campus.vercel.app', 'http://127.0.0.1:5501'], // or your frontend URL
  credentials: true
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
