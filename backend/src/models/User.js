
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    university: {
      type: String,
      default: ""
    },

    course: {
      type: String,
      default: ""
    },

    year: {
      type: Number,
      default: 1
    },

    bio: {
      type: String,
      default: ""
    },

    skillsToTeach: {
      type: [String],
      default: []
    },

    skillsToLearn: {
      type: [String],
      default: []
    },

    credits: {
      type: Number,
      default: 10
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    
    isBlocked: {
  type: Boolean,
  default: false
}
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
