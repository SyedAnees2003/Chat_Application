const { Message, ConversationMember } = require("../models");

exports.sendMessageService = async ({
  conversationId,
  senderId,
  content,
  messageType = "text"
}) => {
  const isMember = await ConversationMember.findOne({
    where: {
      conversation_id: conversationId,
      user_id: senderId
    }
  });

  if (!isMember) {
    throw new Error("NOT_A_MEMBER");
  }

  const message = await Message.create({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    message_type: messageType
  });

  return message;
};

exports.getMessagesByConversationService = async (conversationId, userId) => {
  const isMember = await ConversationMember.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId
    }
  });

  if (!isMember) {
    throw new Error("NOT_A_MEMBER");
  }

  return Message.findAll({
    where: { conversation_id: conversationId },
    order: [["created_at", "ASC"]]
  });
};
