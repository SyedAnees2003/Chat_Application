const express = require("express");
const protect = require("../middlewares/auth.middleware");
const {
  sendMessage,
  getMessagesByConversation
} = require("../controllers/message.controller");

const router = express.Router();

router.post("/:conversationId", protect, sendMessage);
router.get("/:conversationId", protect, getMessagesByConversation);

module.exports = router;
