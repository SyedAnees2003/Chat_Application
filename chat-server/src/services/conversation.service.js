const { Conversation, ConversationMember, User } = require("../models");
const { Op } = require("sequelize");
const {
  emitMemberAdded,
  emitMemberRemoved
} = require("../config/socket");

const isAdmin = async (conversationId, userId) => {
  const record = await ConversationMember.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId,
      role: "admin"
    }
  });
  return !!record;
};

exports.createPrivateConversationService = async (myId, userId) => {
  if (myId === userId) {
    throw new Error("INVALID_USER");
  }

  // Find existing private conversation between these two users
  const conversations = await Conversation.findAll({
    where: { type: "private" },
    include: [
      {
        model: User,
        through: { attributes: [] }
      }
    ]
  });

  const existingConversation = conversations.find((conversation) => {
    if (conversation.Users.length !== 2) return false;

    const userIds = conversation.Users.map((u) => u.id);
    return userIds.includes(myId) && userIds.includes(userId);
  });

  // 🔒 IMPORTANT: Return existing conversation instead of creating new
  if (existingConversation) {
    return existingConversation;
  }

  // Create new private conversation
  const conversation = await Conversation.create({
    type: "private",
    created_by: myId
  });

  await ConversationMember.bulkCreate([
    {
      conversation_id: conversation.id,
      user_id: myId,
      role: "member"
    },
    {
      conversation_id: conversation.id,
      user_id: userId,
      role: "member"
    }
  ]);

  return Conversation.findByPk(conversation.id, {
    include: [
      {
        model: User,
        through: { attributes: ["role"] }
      }
    ]
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
        attributes: ["id", "name", "email"],
        through: {
          attributes: ["role"] // 🔥 THIS IS THE FIX
        }
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

// =======================
// MEMBERS
// =======================

exports.getConversationMembersService = async (conversationId) => {
  return ConversationMember.findAll({
    where: { conversation_id: conversationId },
    include: [{ model: User }]
  });
};

exports.addMemberToGroupService = async (
  conversationId,
  adminId,
  userId
) => {
  const admin = await isAdmin(conversationId, adminId);
  if (!admin) throw new Error("NOT_ADMIN");

  const exists = await ConversationMember.findOne({
    where: { conversation_id: conversationId, user_id: userId }
  });
  if (exists) return;

  await ConversationMember.create({
    conversation_id: conversationId,
    user_id: userId,
    role: "member"
  });

  const user = await User.findByPk(userId);
  emitMemberAdded(conversationId, user);
};

exports.removeMemberFromGroupService = async (
  conversationId,
  adminId,
  userId
) => {
  const admin = await isAdmin(conversationId, adminId);

  if (!admin && adminId !== userId) {
    throw new Error("NOT_ADMIN");
  }

  await ConversationMember.destroy({
    where: { conversation_id: conversationId, user_id: userId }
  });

  emitMemberRemoved(conversationId, userId);
};
