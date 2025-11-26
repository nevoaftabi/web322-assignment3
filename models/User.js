const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { 
    type: String, 
    unique: true,
    required: true
  },
  email: { 
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});
 
module.exports = mongoose.model("User", userSchema); 