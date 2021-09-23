const { DataTypes } = require("sequelize"); //for checking datatypes
const sequelize = require("../db"); //for connecting to our database

const Dog = sequelize.define(
  "dog",
  {
    id: {
      type: DataTypes.INTEGER, //MATCH OWNER ID
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ad_description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    temperament: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    is_female: {
      type: DataTypes.BOOLEAN,
      allowNUll: false,
    },
    location: {
        type: DataTypes.JSON,
      },
    // owner_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // }
  });

  Dog.filterResults = async(callback) => {
    const allDogs = await Dog.findAll()
    return allDogs.filter(callback)
  }
  Dog.sortResults = async(callback) => {
    const allDogs = await Dog.findAll()
    return allDogs.sort(callback)
  }

module.exports = Dog
