
const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile
} = require("../controllers/userController");

const { protect } = require("../middlewares/authMiddleware");

// Get profile
router.get("/profile", protect, getMyProfile);

// Update profile
router.put("/profile", protect, updateMyProfile);

module.exports = router;
