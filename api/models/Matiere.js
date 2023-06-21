/**
 * @module Matiere
 *
 * @description
 *   la matière d'étude et peut etre la meme pour plusieur niveau
 *
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'matieres',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'matieres',
    hooks: {
      beforeSave(matiere,options){
          if(matiere.isNewRecord){
              matiere.active=true
          }
      }
    }
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
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      required: true,
    },
    color: {
      type: DataTypes.STRING,
      required: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
    }
  },
  associations:()=>{

  }


};
