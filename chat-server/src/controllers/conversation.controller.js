const {
    createPrivateConversationService,
    createGroupConversationService,
    getMyConversationsService,
    getConversationByIdService
  } = require("../services/conversation.service");
  
  exports.createPrivateConversation = async (req, res) => {
    try {
      const conversation = await createPrivateConversationService(
        req.user.id,
        req.body.userId
      );
      res.status(201).json(conversation);
    } catch (error) {
      if (error.message === "INVALID_USER") {
        return res.status(400).json({ message: "Invalid user" });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  };
  
  exports.createGroupConversation = async (req, res) => {
    try {
      const conversation = await createGroupConversationService(
        req.user.id,
        req.body.name,
        req.body.members
      );
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create group" });
    }
  };
  
  exports.getMyConversations = async (req, res) => {
    try {
      const conversations = await getMyConversationsService(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  };
  
  exports.getConversationById = async (req, res) => {
    try {
      const conversation = await getConversationByIdService(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  };
  