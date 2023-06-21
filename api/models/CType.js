/**
 * @module CType
 *
 * @description
 *   tells the type of the course,
 *   PREDEFINED MODEL
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'c_types',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'c_types',

  },

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      required: true,
      unique:true
    },

  },
  associations:()=>{

  }


};
