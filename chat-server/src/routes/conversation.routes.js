const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  createPrivateConversation,
  createGroupConversation,
  getMyConversations,
  getConversationById
} = require("../controllers/conversation.controller");

const {
  getConversationMembers,
  addMemberToGroup,
  removeMemberFromGroup
} = require("../controllers/conversation.controller");

const router = express.Router();

router.post("/private", protect, createPrivateConversation);
router.post("/group", protect, createGroupConversation);
router.get("/", protect, getMyConversations);
router.get("/:id", protect, getConversationById);
router.get("/:id/members", protect, getConversationMembers);
router.post("/:id/members", protect, addMemberToGroup);
router.delete("/:id/members", protect, removeMemberFromGroup);

module.exports = router;
