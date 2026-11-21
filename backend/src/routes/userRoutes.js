
const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getAllStudents
} = require("../controllers/userController");

const { protect } = require("../middlewares/authMiddleware");

// Get all registered students
router.get("/students", protect, getAllStudents);

// Get logged-in student's profile
router.get("/profile", protect, getMyProfile);

// Update logged-in student's profile
router.put("/profile", protect, updateMyProfile);

module.exports = router;
