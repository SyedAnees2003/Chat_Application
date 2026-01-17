const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createPrivateConversation,
  createGroupConversation,
  getMyConversations,
  getConversationById
} = require("../controllers/conversation.controller");

const router = express.Router();

router.post("/private", protect, createPrivateConversation);
router.post("/group", protect, createGroupConversation);
router.get("/", protect, getMyConversations);
router.get("/:id", protect, getConversationById);

module.exports = router;
