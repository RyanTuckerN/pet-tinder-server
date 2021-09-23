const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const { Sequelize } = sequelize;
const { Op } = Sequelize;

const Like = sequelize.define("like", {
  //SAVE PK of target user Liked along with PK of 'this' user
  liked_dog_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  superlike: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // owner_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // }
});

Like.getMatches = (user_id) => {
  return Like.findAll({ where: { liked_dog_id: user_id } }).then((data) => {
    const dogsThatLikeYou = data;
    return Like.findAll({ where: { userId: user_id } }).then((data) => {
      const dogsYouLike = data;
      const removeNonMatches = (youLike, likeYou) => {
        const arrayDiff = (a, b) => a.filter((n) => b.includes(n));
        return arrayDiff(
          youLike.map((d) => d.liked_dog_id),
          likeYou.map((d) => d.userId)
        );
      };
      const arrOfIds = removeNonMatches(dogsYouLike, dogsThatLikeYou);
      return sequelize.models.dog
        .findAndCountAll({
          where: {
            id: {
              [Op.in]: arrOfIds,
            },
          },
          include: {
            model: sequelize.models.user,
            include: {
              model: Like,
              where: { liked_dog_id: user_id },
              attributes: {
                exclude: ["id", "updatedAt", "createdAt", "userId"],
              },
            },
            attributes: {
              exclude: ["createdAt", "updatedAt", "passwordhash", "location"],
            },
          },
          attributes: {
            exclude: ["updatedAt", "userId"],
            include: ["createdAt"],
          },
        })
        .then((matches) => {
          return matches.rows;
        });
    });
  });
};

module.exports = Like;
