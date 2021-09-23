const express = require("express");
const router = express.Router();
const { Like, Dog, User } = require("../models");
const { Op } = require("sequelize");
const validateSession = require("../middleware/validateSession");

//LIKE A DOG *** include superlike in req.body ***
router.post("/:liked_id", validateSession, (req, res) => {
  if (req.params.liked_id == req.user.id) {
    //if the dog is the user's
    res
      .status(200)
      .json({ message: "Of course you like this dog... it is yours!" })
      .catch((err) => res.status(420).json(err));
  } else {
    Dog.findOne({ where: { id: req.params.liked_id } }).then((entry) => {
      if (!entry) {
        //
        res.status(420).json({ message: "This dog does not exist!" });
      } else {
        const { superlike } = req.body;
        Like.findOne({
          where: { liked_dog_id: req.params.liked_id, userId: req.user.id },
        })
          .then((like) => {
            if (like) {
              res.status(400).json({ message: "You already like this dog!" });
            } else {
              Like.create({
                liked_dog_id: req.params.liked_id,
                superlike, //default false
                userId: req.user.id,
              }).then((like) => {
                res.status(200).json({
                  message: `💟 Added dog ${req.params.liked_id} to likes 💟`,
                  like,
                });
              });
            }
          })
          .catch((err) => {
            res
              .status(400)
              .json({ message: "Ruh-roh, something went wrong!", err });
          });
      }
    });
  }
});

//UNLIKE A DOG
router.delete("/:liked_id", validateSession, (req, res) => {
  Like.destroy({
    where: { liked_dog_id: req.params.liked_id, userId: req.user.id },
  }).then((like) => {
    res.status(200).json(
      like > 0
        ? {
            message: `💔 You have removed Dog ${req.params.liked_id} from your list of likes. 💔`,
            deleteCount: like,
          }
        : { message: "No matches to delete!" }
    );
  });
});

//GET ALL LIKES :
//array of objects
//   'dog': dogs the user likes, nested is the user info, 'superlike': boolean
router.get("/mine", validateSession, (req, res) => {
  Like.findAndCountAll({ where: { userId: req.user.id } })
    .then((data) => {
      const { count, rows } = data;
      if (!count) {
        res.status(200).json({ message: "You haven't yet liked any dogs!" });
      } else {
        // res.status(200).json({ count, liked_dogs: rows });
        Dog.findAll({
          where: { id: { [Op.in]: rows.map((d) => d.liked_dog_id) } },
          include: {
            model: User,
            attributes: {
              exclude: ["createdAt", "updatedAt", "passwordhash", "location"],
            },
          },
          attributes: { exclude: ["createdAt", "updatedAt"] },
        }).then((likedDogs) => {
          let result = [];
          for (let i = 0; i < likedDogs.length; i++) {
            result.push({ dog: likedDogs[i], superlike: rows[i].superlike });
          }
          res.status(200).json(result);
        });
      }
    })
    .catch((err) => res.status(501).json({ err }));
});

router.get("/superlikes", validateSession, (req, res) => {
  Like.findAndCountAll({ where: { userId: req.user.id } })
    .then((data) => {
      const { count, rows } = data;
      if (!count) {
        res.status(200).json({ message: "You haven't yet liked any dogs!" });
      } else {
        res.status(200).json(rows);
        // Dog.findAll({
        //   where: { id: { [Op.in]: rows.map((d) => d.liked_dog_id) } },
        //   include: {
        //     model: User,
        //     attributes: {
        //       exclude: ["createdAt", "updatedAt", "passwordhash", "location"],
        //     },
        //   },
        //   attributes: { exclude: ["createdAt", "updatedAt"] },
        // }).then((likedDogs) => {
        //   let result = [];
        //   for (let i = 0; i < likedDogs.length; i++) {
        //     result.push({ dog: likedDogs[i], superlike: rows[i].superlike });
        //   }
        //   res.status(200).json(result);
        // });
      }
    })
    .catch((err) => res.status(501).json({ err }));
});


//GET ALL MATCHES : Returns an object with 'matches' arr and 'count' of results
router.get("/matches", validateSession, (req, res) => {
  Like.findAll({ where: { liked_dog_id: req.user.id } })
  .then((data) => {
      const dogsThatLikeYou = data;
      Like.findAll({ where: { userId: req.user.id } }).then((data) => {
        const dogsYouLike = data;
        const removeNonMatches = (youLike, likeYou) => {
          const arrayDiff = (a, b) => a.filter((n) => b.includes(n));
          return arrayDiff(
            youLike.map((d) => d.liked_dog_id),
            likeYou.map((d) => d.userId)
          );
        };
        const arrOfIds = removeNonMatches(dogsYouLike, dogsThatLikeYou);
        Dog.findAndCountAll({
          where: {
            id: {
              [Op.in]: arrOfIds,
            },
          },
          include: {
            model: User,
            include: {
              model: Like,
              where: { liked_dog_id: req.user.id },
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
        }).then((matches) => {
          res.status(200).json({ matches: matches.rows, count: matches.count });
        });
      });
    })
    .catch((err) => {
      res.status(501).json({ err });
    });
  });
  
  module.exports = router;
  
  //RETURNS ARRAY OF DOGS THAT THE USER SUPERLIKES *** REDUNDANT, because all likes includes superlike t/f? ^^
  // router.get("/mine/superlikes", validateSession, async (req, res) => {
  //   try {
  //     const result = await Like.findAll({
  //       where: { userId: req.user.id, superlike: true },
  //     });
  //     if (!result.length) {
  //       res.status(200).json({ message: "you have no superlikes!" });
  //     } else {
  //       const arr = result.map((l) => l.liked_dog_id);
  //       const dogs = await Dog.findAll({
  //         where: { id: { [Op.in]: arr } },
  //         //attributes allows us to exclude certain columns from the response, among other things
  //         attributes: { exclude: ["createdAt", "updatedAt", "id"] },
  //         include: {
  //           model: User,
  //           include: {
  //             model: Like,
  //             where: { liked_dog_id: req.user.id },
  //             attributes: { exclude: ["id", "updatedAt", "createdAt", "userId"] },
  //           },
  //           attributes: {
  //             exclude: ["createdAt", "updatedAt", "passwordhash", "location"],
  //           },
  //         },
  //         // attributes: { include: ["name"] },
  //       });
  //       res.status(200).json(dogs);
  //     }
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // });