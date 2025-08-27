// app.js
require("dotenv").config();

const express = require("express");
const app = express();
const connectdb = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

/* --- IMPORTANT when behind Nginx (so cookies, IPs, rate limits work) --- */
app.set("trust proxy", 1);

/* ------------------------- CORS (updated) ------------------------- */
/* Add your public origins (IP/domain). Keep localhost for local dev. */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://3.81.66.7",         // your EC2 over HTTP
  "https://3.81.66.7",        // (if you enable HTTPS on IP; usually you won't)
  "https://devconnect.com",   // <-- replace with your real domain when ready
  "http://devconnect.com"
];

app.use(
  cors({
    origin: function (origin, cb) {
      // allow non-browser tools like curl/postman (no origin)
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);

/* ------------------------- Parsers ------------------------- */
app.use(express.json());
app.use(cookieParser());

/* ---------------------- Health check ----------------------- */
/* Nginx: /api/health  -> Node: /health  (because /api is stripped) */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ------------------------- Routes -------------------------- */
/* Keep your routers mounted at root. Nginx proxies /api/* -> /* */
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

/* --------------------- DB + Server boot -------------------- */
connectdb()
  .then(async () => {
    console.log("Database connection successful");

    try {
      // Ensure unique indexes (e.g., unique email)
      await User.init();

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () =>
        console.log(`Server is successfully running on port ${PORT}`)
      );
    } catch (err) {
      console.error("Error initializing User model:", err.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Database cannot be connected:", err.message);
    process.exit(1);
  });

module.exports = app;
