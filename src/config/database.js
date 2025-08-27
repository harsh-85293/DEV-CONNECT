const mongoose  = require("mongoose");

const connectdb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://namastedev:LWmNZnauCZmpLng7@namastenode.oor8bmj.mongodb.net/devconnect"
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
  }
};

module.exports = connectdb;
