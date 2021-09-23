const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Notification = sequelize.define("notification", {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  target: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Notification;
