
const mongoose = require("mongoose");
const Quest = require("../models/Quest");
const User = require("../models/User");

// Get all active quests

// Get all active quests
const getAllQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ isActive: true })
      .populate("createdBy", "name university")
      .populate("participants.student", "name university")
      .sort({ createdAt: -1 });

    const visibleQuests = quests.map((quest) => {
      const questData = quest.toObject();

      const isCreator =
        questData.createdBy?._id?.toString() ===
        req.user._id.toString();

      questData.participants = questData.participants.map(
        (participant) => {
          const studentId =
            participant.student?._id?.toString() ||
            participant.student?.toString();

          const isParticipant =
            studentId === req.user._id.toString();

          // Hide submissions from unrelated students
          if (!isCreator && !isParticipant) {
            delete participant.submission;
          }

          return participant;
        }
      );

      return questData;
    });

    res.json({
      success: true,
      count: visibleQuests.length,
      quests: visibleQuests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Create a new quest
const createQuest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      rewardCredits
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required."
      });
    }

    const reward = Number(rewardCredits ?? 10);

    if (!Number.isInteger(reward) || reward < 1 || reward > 1000) {
      return res.status(400).json({
        success: false,
        message: "Reward must be between 1 and 1000 credits."
      });
    }

    const quest = await Quest.create({
      title,
      description,
      category,
      difficulty: difficulty || "Beginner",
      rewardCredits: reward,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Quest created successfully.",
      quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join a quest
const joinQuest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quest ID."
      });
    }

    const quest = await Quest.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: "Quest not found."
      });
    }

    if (quest.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot join your own quest."
      });
    }

    const alreadyJoined = quest.participants.some(
      (participant) =>
        participant.student.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this quest."
      });
    }

    quest.participants.push({
      student: req.user._id
    });

    await quest.save();

    res.json({
      success: true,
      message: "You joined the quest successfully.",
      quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit completed quest work
const submitQuest = async (req, res) => {
  try {
    const { submission } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quest ID."
      });
    }

    if (
      typeof submission !== "string" ||
      !submission.trim() ||
      submission.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your work or project link (maximum 2000 characters)."
      });
    }

    const quest = await Quest.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: "Quest not found."
      });
    }

    const participant = quest.participants.find(
      (item) =>
        item.student.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "Join this quest before submitting your work."
      });
    }

    if (participant.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This quest has already been approved."
      });
    }

    if (participant.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "Your submission is already waiting for review."
      });
    }

    participant.submission = submission.trim();
    participant.status = "submitted";
    participant.submittedAt = new Date();

    await quest.save();

    res.json({
      success: true,
      message: "Your work was submitted successfully.",
      quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Review a submission and award credits
const reviewSubmission = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected."
      });
    }

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(req.params.studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quest or student ID."
      });
    }

    let reviewedQuest;

    await session.withTransaction(async () => {
      const quest = await Quest.findById(req.params.id).session(session);

      if (!quest) {
        const error = new Error("Quest not found.");
        error.statusCode = 404;
        throw error;
      }

      if (quest.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error(
          "Only the quest creator can review submissions."
        );
        error.statusCode = 403;
        throw error;
      }

      const participant = quest.participants.find(
        (item) =>
          item.student.toString() === req.params.studentId
      );

      if (!participant || participant.status !== "submitted") {
        const error = new Error(
          "Submitted work not found or already reviewed."
        );
        error.statusCode = 404;
        throw error;
      }

      if (status === "approved") {
        const student = await User.findById(
          participant.student
        ).session(session);

        if (!student) {
          const error = new Error("Student account not found.");
          error.statusCode = 404;
          throw error;
        }

        student.credits += quest.rewardCredits;
        await student.save({ session });
      }

      participant.status = status;

      await quest.save({ session });

      reviewedQuest = quest;
    });

    res.json({
      success: true,
      message:
        status === "approved"
          ? "Submission approved and Skill Credits awarded!"
          : "Submission rejected. The student can submit again.",
      quest: reviewedQuest
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
  getAllQuests,
  createQuest,
  joinQuest,
  submitQuest,
  reviewSubmission
};
