const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ConversationMember = sequelize.define(
  "ConversationMember",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      defaultValue: "member"
    }
  },
  {
    tableName: "conversation_members",
    timestamps: false,
    underscored: true
  }
);

module.exports = ConversationMember;
