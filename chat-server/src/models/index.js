const sequelize = require("../config/database");

const User = require("./User");
const Conversation = require("./Conversation");
const ConversationMember = require("./ConversationMember");
const Message = require("./Message");

// =======================
// Message associations
// =======================

Conversation.hasMany(Message, {
  foreignKey: "conversation_id"
});
Message.belongsTo(Conversation, {
  foreignKey: "conversation_id"
});

User.hasMany(Message, {
  foreignKey: "sender_id"
});
Message.belongsTo(User, {
  foreignKey: "sender_id"
});

// =======================
// Conversation ↔ User (many-to-many)
// =======================

User.belongsToMany(Conversation, {
  through: ConversationMember,
  foreignKey: "user_id"
});

Conversation.belongsToMany(User, {
  through: ConversationMember,
  foreignKey: "conversation_id"
});

// =======================
// ConversationMember associations (IMPORTANT)
// =======================

// ConversationMember → User
ConversationMember.belongsTo(User, {
  foreignKey: "user_id"
});
User.hasMany(ConversationMember, {
  foreignKey: "user_id"
});

// ConversationMember → Conversation  ✅ MISSING BEFORE
ConversationMember.belongsTo(Conversation, {
  foreignKey: "conversation_id"
});
Conversation.hasMany(ConversationMember, {
  foreignKey: "conversation_id"
});

// =======================
// Conversation creator
// =======================

Conversation.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator"
});

module.exports = {
  sequelize,
  User,
  Conversation,
  ConversationMember,
  Message
};
