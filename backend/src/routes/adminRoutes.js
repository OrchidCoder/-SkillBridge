
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middlewares/authMiddleware");

const {
  getAdminStats,
  getAllStudents,
  updateStudentBlock,
  getAllAdminSkills,
  deleteAdminSkill,
  getAllAdminQuests,
  updateQuestStatus,
  getAllAdminRequests,
  getCreditMonitoring
} = require("../controllers/adminController");

router.use(protect, adminOnly);

// Dashboard statistics
router.get("/stats", getAdminStats);

// Student management
router.get("/students", getAllStudents);
router.patch("/students/:id/block", updateStudentBlock);

// Skill management
router.get("/skills", getAllAdminSkills);
router.delete("/skills/:id", deleteAdminSkill);

// Quest management
router.get("/quests", getAllAdminQuests);
router.patch("/quests/:id/status", updateQuestStatus);

// Request monitoring
router.get("/requests", getAllAdminRequests);

// Skill Credit monitoring
router.get("/credits", getCreditMonitoring);

module.exports = router;
