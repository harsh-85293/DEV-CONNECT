const mongoose  = require("mongoose");

const connectdb = async() => {
    await mongoose.connect(
        "mongodb+srv://harsh:ramchandani@final.lnxlk6l.mongodb.net/"
    )
}

module.exports = connectdb;

