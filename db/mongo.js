const mongoose = require("mongoose");

module.exports = async function connectMongo() {
  await mongoose.connect(
    process.env.MONGO_URL, { 
    serverSelectionTimeoutMS: 5000,   
    socketTimeoutMS: 45000 
  }
  );
  console.log('MongoDB started');
};