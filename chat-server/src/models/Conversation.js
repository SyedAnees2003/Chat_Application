const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM("private", "group"),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150)
    },
    created_by: {
      type: DataTypes.BIGINT
    }
  },
  {
    tableName: "conversations",
    timestamps: true,
    underscored: true
  }
);

module.exports = Conversation;
