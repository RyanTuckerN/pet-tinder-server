const { User, Conversation, Message, Dog, Notification } = require("../models");
const sequelize = require("../db");
const mobileSockets = {};
const chatTargets = {};

module.exports = (socket) => {
  //***LOGIN EVENT***//
  socket.on("newLogin", (id) => {
    Promise.all([
      User.findOne({ where: { id }, include: { model: Dog } }),
      sequelize.models.like.getMatches(id),
    ])
      .then(([user, matches]) => {
        mobileSockets[user.id] = socket.id;
        socket.emit("userCreated", {
          user,
          matches,
        });
        socket.emit("newUser", { mobileSockets });
        socket.broadcast.emit("newUser", { mobileSockets });
        console.log('MobileSockets📱: ', mobileSockets)  

      })
      .catch((err) => console.error(err));
  });

  //***CHAT EVENT***//
  socket.on("chat", (users) => {
    Conversation.findOrCreateConversation(users.sender.id, users.receiver.id)
      .then((conversation) => {
        socket.emit("priorMessages", conversation);
        console.log('MobileSockets📱: ', mobileSockets)  

      })
      .catch((err) => console.error(err));
  });

  socket.on("matchRequest", (id) => {
    Promise.all([
      User.findOne({ where: { id }, include: { model: Dog } }),
      sequelize.models.like.getMatches(id),
    ])
      .then(([user, matches]) => {
        mobileSockets[user.id] = socket.id;
        socket.emit("userCreated", {
          user,
          matches,
        });
        socket.emit("newUser", { mobileSockets });
        socket.broadcast.emit("newUser", { mobileSockets });
        socket.broadcast.emit("matchUpdate", {
          message: "update your matches",
        });
      })
      .catch((err) => console.error(err));
  });

  //*** NOTIFICATION EVENT- SENDS NOTIFICATIONS TO BOTH PARTIES UPON MATCHING***//
  socket.on("notificationRequest", async (targets) => {
    const { userId, target } = targets;
    const userNotification = await Notification.findAll({ where: { userId } });
    const targetNotification = await Notification.findAll({
      where: { userId: target },
    });
    socket.emit("notificationResponse", userNotification);
    mobileSockets[target]
      ? socket
          .to(mobileSockets[target])
          .emit("notificationResponse", targetNotification)
      : null;
  });
  //***MESSAGE EVENT***//
  socket.on("message", ({ text, sender, receiver }) => {
    Message.createMessage(text, sender, receiver).then((message) => {
      Conversation.findOrCreateConversation(sender.id, receiver.id).then(
        (conversation) => {
          socket.emit("incomingMessage", { message, conversation }); //send the message back to the sender
          const receiverSocketId = mobileSockets[receiver.id];
          if (chatTargets[receiver.id] == sender.id) {
            socket
              .to(receiverSocketId)
              .emit("incomingMessage", { message, conversation });
          } //send the message to the other user if they are online? maybe?
        }
      );
    });
  });
  socket.on('typing',({typing, chatTarget, senderId})=>{
    if(chatTargets[chatTarget?.id]===senderId){
      const receiverSocketId = mobileSockets[chatTarget?.id];
      socket.to(receiverSocketId).emit('targetTyping', {typing, senderId})
    }

  })

  socket.on("socketUpdate", () => {
    socket.emit("newUser", { mobileSockets });
    socket.broadcast.emit("newUser", { mobileSockets });
  });
  socket.on("disconnect", () => {
    const getKeyByValue = (object, value) => {
      return Object.keys(object).find((key) => object[key] === value);
    };
    const loggedOutId = getKeyByValue(mobileSockets, socket.id);
    delete mobileSockets[loggedOutId];
    socket.emit("newUser", { mobileSockets });
    socket.broadcast.emit("newUser", { mobileSockets });
  });

  socket.on("chatTarget", ({ chatTarget, senderId }) => {
    chatTargets[senderId] = chatTarget?.id;
    console.log(chatTargets);
  });

  socket.on("leftChat", ({ id }) => delete chatTargets[id]);
};
