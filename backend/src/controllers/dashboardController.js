
const Skill = require("../models/skill");
const SkillRequest = require("../models/SkillRequest");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      teachingSkills,
      learningSkills,
      completedSessions,
      pendingRequests,
      incomingRequests,
      recentRequests
    ] = await Promise.all([
      Skill.countDocuments({
        owner: userId,
        type: "Teaching",
        isActive: true
      }),

      Skill.countDocuments({
        owner: userId,
        type: "Learning",
        isActive: true
      }),

      SkillRequest.countDocuments({
        $or: [
          { requester: userId },
          { skillOwner: userId }
        ],
        status: "completed"
      }),

      SkillRequest.countDocuments({
        requester: userId,
        status: "pending"
      }),

      SkillRequest.countDocuments({
        skillOwner: userId,
        status: "pending"
      }),

      SkillRequest.find({
        $or: [
          { requester: userId },
          { skillOwner: userId }
        ]
      })
        .populate("skill", "title category level")
        .populate("requester", "name")
        .populate("skillOwner", "name")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        credits: req.user.credits,
        teachingSkills,
        learningSkills,
        completedSessions,
        pendingRequests,
        incomingRequests,
        recentRequests
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics."
    });
  }
};

module.exports = { getDashboardStats };
