
const express = require("express");
const router = express.Router();

const {
  createSkill,
  getAllSkills,
  getMySkills,
  deleteSkill
} = require("../controllers/skillController");

const { protect } = require("../middlewares/authMiddleware");

// Public route: View and search skills
router.get("/", getAllSkills);

// Protected routes: Login required
router.post("/", protect, createSkill);
router.get("/my-skills", protect, getMySkills);
router.delete("/:id", protect, deleteSkill);

module.exports = router;
