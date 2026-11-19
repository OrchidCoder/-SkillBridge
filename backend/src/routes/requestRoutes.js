
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  cancelRequest,
  completeRequest
} = require("../controllers/requestController");

router.post("/", protect, createRequest);

router.get("/my-requests", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequests);

router.patch("/:id/status", protect, updateRequestStatus);
router.patch("/:id/cancel", protect, cancelRequest);
router.patch("/:id/complete", protect, completeRequest);

module.exports = router;
