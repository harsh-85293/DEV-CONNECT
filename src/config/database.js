const mongoose  = require("mongoose");

const connectdb = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 
      "mongodb+srv://namastedev:whAP4tG4NJWEDGCV@namastenode.oor8bmj.mongodb.net/devconnect";
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err; // Re-throw to handle in app.js
  }
};

module.exports = connectdb;
