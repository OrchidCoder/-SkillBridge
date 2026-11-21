
const express = require("express");
const router = express.Router();

const {
  getAllQuests,
  createQuest,
  joinQuest,
  submitQuest,
  reviewSubmission
} = require("../controllers/questController");

const { protect } = require("../middlewares/authMiddleware");

// View all available quests
router.get("/", protect, getAllQuests);

// Create a new quest
router.post("/", protect, createQuest);

// Join a quest
router.post("/:id/join", protect, joinQuest);

// Submit completed quest work
router.post("/:id/submit", protect, submitQuest);

// Approve or reject a submission
router.put("/:id/review/:studentId", protect, reviewSubmission);

module.exports = router;
