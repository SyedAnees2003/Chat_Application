const sequelize = require("../config/database");

const User = require("./User");
const Conversation = require("./Conversation");
const ConversationMember = require("./ConversationMember");
const Message = require("./Message");

Conversation.hasMany(Message, { foreignKey: "conversation_id" });
Message.belongsTo(Conversation, { foreignKey: "conversation_id" });

User.hasMany(Message, { foreignKey: "sender_id" });
Message.belongsTo(User, { foreignKey: "sender_id" });

User.belongsToMany(Conversation, {
  through: ConversationMember,
  foreignKey: "user_id"
});

Conversation.belongsToMany(User, {
  through: ConversationMember,
  foreignKey: "conversation_id"
});

Conversation.belongsTo(User, {
  foreignKey: "created_by"
});

module.exports = {
  sequelize,
  User,
  Conversation,
  ConversationMember,
  Message
};
