
const mongoose = require("mongoose");

const skillRequestSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    skillOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    credits: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active requests for the same skill.
skillRequestSchema.index(
  { skill: 1, requester: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] }
    }
  }
);

module.exports = mongoose.model("SkillRequest", skillRequestSchema);
