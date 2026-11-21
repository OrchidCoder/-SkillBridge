
const User = require("../models/User");

// Get logged-in student's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update logged-in student's profile
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      university,
      course,
      year,
      bio,
      skillsToTeach,
      skillsToLearn
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty."
        });
      }
      user.name = name.trim();
    }

    if (university !== undefined) user.university = university.trim();
    if (course !== undefined) user.course = course.trim();
    if (bio !== undefined) user.bio = bio.trim();

    if (year !== undefined) {
      const parsedYear = Number(year);

      if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 6) {
        return res.status(400).json({
          success: false,
          message: "Year must be between 1 and 6."
        });
      }

      user.year = parsedYear;
    }

    if (skillsToTeach !== undefined) {
      if (!Array.isArray(skillsToTeach)) {
        return res.status(400).json({
          success: false,
          message: "Teaching skills must be an array."
        });
      }
      user.skillsToTeach = skillsToTeach;
    }

    if (skillsToLearn !== undefined) {
      if (!Array.isArray(skillsToLearn)) {
        return res.status(400).json({
          success: false,
          message: "Learning skills must be an array."
        });
      }
      user.skillsToLearn = skillsToLearn;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all students for the student directory
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      _id: { $ne: req.user._id },
      role: "student"
    })
      .select("name email university course year bio skillsToTeach skillsToLearn credits createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents
};