
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");

// ADDITION 1: Import authentication routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const skillRoutes = require("./src/routes/skillRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();

app.use(helmet());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// ADDITION 2: Register authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SkillBridge API"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`SkillBridge backend running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
  });
};

startServer();
