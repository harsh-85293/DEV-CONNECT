require('dotenv').config();

const express = require("express");
const app = express();
const connectdb = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser")
const cors = require("cors")

app.use(cors({
  origin : ["http://localhost:5173", "http://localhost:5174"],
  credentials : true,//stills send the cookies when you are not in network this is whitelisting the network
}))
app.use(express.json());
app.use(cookieParser())

const authRouter = require("./routes/auth")
const userRouter = require("./routes/user")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/request")

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectdb()
  .then(async () => {
    console.log("Database connection successful");

    try {
      await User.init(); // ensure unique indexes
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () =>
        console.log(`Server is successfully running on port ${PORT}`)
      );
    } catch (err) {
      console.error("Error initializing User model:", err.message);
      process.exit(1); // stop server if init fails
    }
  })
  .catch((err) => {
    console.error("Database cannot be connected:", err.message);
    process.exit(1); // Exit if database connection fails
  });
