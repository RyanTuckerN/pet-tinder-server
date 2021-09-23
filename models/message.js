const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Message = sequelize.define("message", {
  text: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }, 
  user: { 
    type: DataTypes.JSON 
  }
});
 
Message.createMessage = (text, sender, receiver) => {
  console.log(`🖥 Saving to database: ${text} from ${sender.profile_name} to ${receiver.profile_name}`)
  return Promise.all([
    Message.create({
      text,
      user: {
        _id: sender.id,
        name: sender.profile_name
      }
    }),
    sequelize.models.conversation.findOrCreateConversation(sender.id, receiver.id)
  ])
    .then(([message, conversation]) => message.setConversation(conversation));
};

module.exports = Message