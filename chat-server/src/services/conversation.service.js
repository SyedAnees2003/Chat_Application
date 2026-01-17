const { Conversation, ConversationMember, User } = require("../models");
const { Op } = require("sequelize");

exports.createPrivateConversationService = async (myId, userId) => {
  if (myId === userId) {
    throw new Error("INVALID_USER");
  }

  // Find existing private conversation
  const conversations = await Conversation.findAll({
    where: { type: "private" },
    include: [
      {
        model: User,
        through: { attributes: [] }
      }
    ]
  });

  const existing = conversations.find((c) => {
    const ids = c.Users.map((u) => u.id);
    return ids.includes(myId) && ids.includes(userId);
  });

  if (existing) {
    return existing;
  }

  const conversation = await Conversation.create({
    type: "private",
    created_by: myId
  });

  await ConversationMember.bulkCreate([
    { conversation_id: conversation.id, user_id: myId },
    { conversation_id: conversation.id, user_id: userId }
  ]);

  return Conversation.findByPk(conversation.id, {
    include: [{ model: User, through: { attributes: [] } }]
  });
};

exports.createGroupConversationService = async (myId, name, members) => {
  const conversation = await Conversation.create({
    type: "group",
    name,
    created_by: myId
  });

  const data = members.map((id) => ({
    conversation_id: conversation.id,
    user_id: id
  }));

  data.push({
    conversation_id: conversation.id,
    user_id: myId,
    role: "admin"
  });

  await ConversationMember.bulkCreate(data);

  return Conversation.findByPk(conversation.id, {
    include: [{ model: User, through: { attributes: [] } }]
  });
};

exports.getMyConversationsService = async (userId) => {
  // First, get conversation IDs where the user is a member
  const memberRecords = await ConversationMember.findAll({
    where: { user_id: userId },
    attributes: ["conversation_id"]
  });
  
  const conversationIds = memberRecords.map(record => record.conversation_id);
  
  if (conversationIds.length === 0) {
    return []; // Return empty array if no conversations found
  }
  
  // Then fetch conversations with those IDs
  const conversations = await Conversation.findAll({
    where: {
      id: {
        [Op.in]: conversationIds
      }
    },
    include: [
      {
        model: User,
        through: { attributes: [] },
        attributes: ['id', 'name', 'email'] // Select only needed fields
      }
    ],
    order: [["updated_at", "DESC"]]
  });
  
  return conversations;
};


exports.getConversationByIdService = async (id) => {
  return Conversation.findOne({
    where: { id },
    include: [
      {
        model: User,
        through: { attributes: ["role"] }
      }
    ]
  });
};
