
const Skill = require("../models/skill");

// Add a new skill
const createSkill = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      type,
      creditsRequired
    } = req.body;

    if (!title || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and type are required."
      });
    }

    const skill = await Skill.create({
      title,
      description,
      category,
      level,
      type,
      creditsRequired,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully.",
      skill
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all active skills
const getAllSkills = async (req, res) => {
  try {
    const { search, category, type, level } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (level) filter.level = level;

    const skills = await Skill.find(filter)
      .populate("owner", "name university course")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get logged-in student's skills
const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({
      owner: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a skill owned by the logged-in student
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found or you do not have permission."
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSkill,
  getAllSkills,
  getMySkills,
  deleteSkill
};
