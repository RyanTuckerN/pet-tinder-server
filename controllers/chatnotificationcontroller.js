const express = require("express");
const router = express.Router();
const { ChatNotification } = require("../models");
const validateSession = require("../middleware/validateSession");

router.get('/', validateSession, async(req,res)=>{
  try{
    const chatNotes = await ChatNotification.findAll({where: {userId: req.user.id}})
    res.status(200).json(chatNotes)
  } catch (err){
    res.status(500).json(err)
  }
})

router.delete("/:senderId", validateSession, async (req, res) => {
  try {
    const deletions = await ChatNotification.destroy({
      where: { userId: req.user.id, senderId: req.params.senderId },
    });
    res.status(200).json({ deletions });
  } catch (err) {
    res.status(500).json({ err });
  }
});

module.exports = router;
