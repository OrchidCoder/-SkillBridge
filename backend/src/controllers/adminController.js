
const User = require("../models/User");
const Skill = require("../models/skill");
const Quest = require("../models/Quest");
const SkillRequest = require("../models/SkillRequest");

// Dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalAdmins,
      totalSkills,
      totalQuests,
      totalSessions,
      totalCredits
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      Skill.countDocuments(),
      Quest.countDocuments(),
      SkillRequest.countDocuments(),
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$credits" } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalAdmins,
        totalSkills,
        totalQuests,
        totalSessions,
        totalCredits: totalCredits[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Block or unblock students
const updateStudentBlock = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid block status."
      });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "student"
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    student.isBlocked = isBlocked;
    await student.save();

    res.json({
      success: true,
      message: isBlocked ? "Student blocked." : "Student unblocked.",
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all skills
const getAllAdminSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove a skill listing
const deleteAdminSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill listing not found."
      });
    }

    res.json({
      success: true,
      message: "Skill listing removed successfully."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all quests
const getAllAdminQuests = async (req, res) => {
  try {
    const quests = await Quest.find()
      .populate("createdBy", "name email")
      .populate("participants.student", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, quests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Activate or deactivate a quest
const updateQuestStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid quest status."
      });
    }

    const quest = await Quest.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: "Quest not found."
      });
    }

    res.json({
      success: true,
      message: isActive ? "Quest activated." : "Quest deactivated.",
      quest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monitor all skill requests
const getAllAdminRequests = async (req, res) => {
  try {
    const requests = await SkillRequest.find()
      .populate("skill", "title category type")
      .populate("requester", "name email")
      .populate("skillOwner", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monitor student credit balances
const getCreditMonitoring = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email credits isBlocked")
      .sort({ credits: -1 });

    const totalCredits = students.reduce(
      (total, student) => total + (student.credits || 0),
      0
    );

    res.json({
      success: true,
      totalCredits,
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
  updateStudentBlock,
  getAllAdminSkills,
  deleteAdminSkill,
  getAllAdminQuests,
  updateQuestStatus,
  getAllAdminRequests,
  getCreditMonitoring
};
