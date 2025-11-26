const mongoose = require("mongoose");

module.exports = async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB started');
};