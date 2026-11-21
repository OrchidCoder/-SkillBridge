
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const skillRoutes = require("./src/routes/skillRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const questRoutes = require("./src/routes/questRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

// Security
app.use(helmet());

// CORS configuration for local and deployed frontend
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SkillBridge API"
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillBridge backend is healthy"
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkillBridge backend running on port ${PORT}`);
  });
};

startServer();
