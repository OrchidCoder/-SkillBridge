
const mongoose = require("mongoose");
const Skill = require("../models/skill");
const User = require("../models/User");
const SkillRequest = require("../models/SkillRequest");

// Create a skill request
const createRequest = async (req, res) => {
  try {
    const { skillId, message } = req.body;

    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID."
      });
    }

    const skill = await Skill.findOne({
      _id: skillId,
      isActive: true,
      type: "Teaching"
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Teaching skill not found."
      });
    }

    if (skill.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own skill."
      });
    }

    const existingRequest = await SkillRequest.findOne({
      skill: skill._id,
      requester: req.user._id,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have an active request for this skill."
      });
    }

    const request = await SkillRequest.create({
      skill: skill._id,
      requester: req.user._id,
      skillOwner: skill.owner,
      message: message || "",
      credits: skill.creditsRequired
    });

    res.status(201).json({
      success: true,
      message: "Skill request submitted successfully.",
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get requests sent by logged-in student
const getMyRequests = async (req, res) => {
  try {
    const requests = await SkillRequest.find({
      requester: req.user._id
    })
      .populate("skill", "title category level creditsRequired")
      .populate("skillOwner", "name email university")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get requests received by logged-in student
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await SkillRequest.find({
      skillOwner: req.user._id
    })
      .populate("skill", "title category level creditsRequired")
      .populate("requester", "name email university")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Accept or reject a request
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected."
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID."
      });
    }

    const request = await SkillRequest.findOne({
      _id: req.params.id,
      skillOwner: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be updated."
      });
    }

    request.status = status;
    await request.save();

    res.json({
      success: true,
      message: `Request ${status} successfully.`,
      request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Requester cancels a pending request
const cancelRequest = async (req, res) => {
  try {
    const request = await SkillRequest.findOne({
      _id: req.params.id,
      requester: req.user._id,
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found."
      });
    }

    request.status = "cancelled";
    await request.save();

    res.json({
      success: true,
      message: "Request cancelled successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Complete a session and transfer credits atomically
const completeRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID."
      });
    }

    let completedRequest;

    await session.withTransaction(async () => {
      const request = await SkillRequest.findOne({
        _id: req.params.id,
        skillOwner: req.user._id,
        status: "accepted"
      }).session(session);

      if (!request) {
        const error = new Error(
          "Accepted request not found or already completed."
        );
        error.statusCode = 404;
        throw error;
      }

      const requester = await User.findById(
        request.requester
      ).session(session);

      const skillOwner = await User.findById(
        request.skillOwner
      ).session(session);

      if (!requester || !skillOwner) {
        const error = new Error("Student account not found.");
        error.statusCode = 404;
        throw error;
      }

      if (requester.credits < request.credits) {
        const error = new Error(
          "Student does not have enough credits to complete this session."
        );
        error.statusCode = 400;
        throw error;
      }

      requester.credits -= request.credits;
      skillOwner.credits += request.credits;

      await requester.save({ session });
      await skillOwner.save({ session });

      request.status = "completed";
      await request.save({ session });

      completedRequest = request;
    });

    res.json({
      success: true,
      message: "Session completed and credits transferred successfully.",
      request: completedRequest
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  cancelRequest,
  completeRequest
};
