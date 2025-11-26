const mongoose = require("mongoose");

module.exports = async function connectMongo() {
  await mongoose.connect(
    process.env.MONGO_URL, { 
    serverSelectionTimeoutMS: 500000,   
    socketTimeoutMS: 4500000 
  }
  );
  console.log('MongoDB started');
};