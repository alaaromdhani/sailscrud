const { DataTypes } = require('sequelize');

/**
 * @module Feature
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {

  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'countries'
  },
  datastore: 'default',
  tableName: 'countries',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    code: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 2
    },


    name: {
      type: DataTypes.STRING,
      minLength: 2,
      allowNull: false
    },


    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

  },
  associations:()=>{
    Country.hasMany(User,{
      foreignKey:'country_id'

    });
    Country.hasMany(State,{
      foreignKey:'country_id'
    });



  }

};
