/**
 * @module Chapitre
 *
 * @description
 *   tells the chapter of the course
 *   PREDEFINED MODEL
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'chapitres',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    indexes:
      [{
        unique: true,
        fields: ['order']
      }]
    ,
    tableName: 'chapitres',

  },

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
     
    },
    name: {
      type: DataTypes.STRING,
      required: true,
      
    },
    order:{
      type: DataTypes.INTEGER,
      required: true,
     
    }

  },
  associations:()=>{
    
  }


};
