const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ChatNotification = sequelize.define("chatNotification", {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = ChatNotification;
