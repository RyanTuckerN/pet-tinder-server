const User = require("./user");
const Dog = require("./dog");
const Like = require("./like");
const Message = require("./message");
const Notification = require('./notification')
const Conversation = require("./conversation");
const ChatNotification = require("./chatNotification")

//USER & DOG
Dog.belongsTo(User)
User.hasOne(Dog)

//LIKES
Like.belongsTo(User)
User.hasMany(Like)

//CHAT 
Conversation.belongsTo(User, { as: "user1" });
Conversation.belongsTo(User, { as: "user2" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

//NOTIFICATIONS 
Notification.belongsTo(User)
User.hasMany(Notification)

ChatNotification.belongsTo(User)
User.hasMany(ChatNotification)

module.exports = {
  User,
  Dog,
  Like,
  Message,
  Notification,
  Conversation,
  ChatNotification
};
