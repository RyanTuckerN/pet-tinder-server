const express = require('express')
const { Dog } = require('../models')
const router = express.Router()
const validateSession = require('../middleware/validateSession');
const { Op } = require('sequelize')
// ALL OUR CONTROLLERS FOR DOG GO HERE 

//GET MY DOG
router.get("/",validateSession, (req, res) => {
    const query = {where:{id: req.user.id}};
    Dog.findOne(query)
    .then((dog) => res.status(200).json(dog))
    .catch((err) => res.status(500).json({error:err}))
});

// GET DOG BY ID
router.get("/id/:id",validateSession, (req, res) => {
  const query = {where:{id: req.params.id}};
  Dog.findOne(query)
  .then((dog) => res.status(200).json(dog))
  .catch((err) => res.status(500).json({error:err}))
});

// DELETE DOG BY ID
router.delete("/",validateSession, (req, res) => {
    const query = {where: {id: req.user.id} };
    Dog.destroy(query)
    .then(()=> res.status(200).json({message: "Dog Entry Deleted"}))
    .catch((err) => res.status(500).json({error:err}));

});

router.put("/:id", validateSession, (req, res) => {


    const { photo_url, name, breed, weight, age, ad_description, temperament, is_female, location } = req.body
    const updateDog = {
        photo_url, name, breed, weight, age, ad_description, temperament, is_female, location,
        userId: req.user.id,

    };
    const query = {where: {id:req.params.id, userId:req.user.id}}

    Dog.update(updateDog, query)
    .then((dog) => {
        if (!dog[0]) {
          res.status(403).json({
            message: "This dog either doesn't exist or it isn't yours!",
          });
        } else {
          res.status(200).json({
            message: `${updateDog.name}'s profile has been updated!`,
            updateCount: dog,
          });
        }
      })
    .catch((err)=>res.status(500).json({error:err}))
})



router.post('/', validateSession, (req, res) => {

    const { photo_url, name, breed, weight, age, ad_description, temperament, is_female, location } = req.body
    const dogEntry = {
        photo_url, name, breed, weight, age, ad_description, temperament, is_female, location, 
        id: req.user.id, 
        userId: req.user.id // *** MAKE SURE THIS MATCHES ON THE PUT!!! *** //
    }
    Dog.create(dogEntry)
        .then(dog => res.status(200).json(dog))
        .catch(err => res.status(500).json({ error: err }))
});

router.get('/all', validateSession, (req, res) => {
    Dog.findAll({where: {id: {[Op.not]: req.user.id}}})
        .then(dogs => res.status(200).json({dogs}))
        .catch(err => res.status(500).json({ error: err }))
});


module.exports = router;