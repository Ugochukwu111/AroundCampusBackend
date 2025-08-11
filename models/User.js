const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String,   sparse: true, unique: true ,trim: true 
},
  phoneNumber: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  school: { type: String, required: true },
  password: { type: String, required: true },
  isSeller: { type: Boolean, default: true }
});




// scripts for forget password 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
