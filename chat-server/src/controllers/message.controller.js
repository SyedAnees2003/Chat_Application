const {
    sendMessageService,
    getMessagesByConversationService
  } = require("../services/message.service");
  
  exports.sendMessage = async (req, res) => {
    try {
      const message = await sendMessageService({
        conversationId: req.params.conversationId,
        senderId: req.user.id,
        content: req.body.content,
        messageType: req.body.messageType
      });
  
      res.status(201).json(message);
    } catch (error) {
      if (error.message === "NOT_A_MEMBER") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  };
  
  exports.getMessagesByConversation = async (req, res) => {
    try {
      const messages = await getMessagesByConversationService(
        req.params.conversationId,
        req.user.id
      );
  
      res.json(messages);
    } catch (error) {
      if (error.message === "NOT_A_MEMBER") {
        return res.status(403).json({ message: "Access denied" });
      }
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  };
  