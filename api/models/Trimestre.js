/**
 * @module Trimestre
 *
 * @description
 *   tells the portion of the year
 *     PREDEFINED MODEL
 */

const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'trimesters',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'trimesters',

  },

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name_fr: {
      type: DataTypes.STRING,
      required: true,
      unique:true
    },
    name_ar: {
      type: DataTypes.STRING,
      required: true,
      unique:true
    }
  },
  associations:()=>{

  }


};
