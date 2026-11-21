
const mongoose = require("mongoose");

const questSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },

    rewardCredits: {
      type: Number,
      required: true,
      min: 1,
      default: 10
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    participants: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        submission: {
          type: String,
          default: ""
        },

        status: {
          type: String,
          enum: ["joined", "submitted", "approved", "rejected"],
          default: "joined"
        },

        joinedAt: {
          type: Date,
          default: Date.now
        },

        submittedAt: {
          type: Date
        }
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Quest", questSchema);
