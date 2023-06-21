/**
 * @module NiveauScolaire
 *
 * @description
 *   tells which level the student is
 *   PREDEFINED MODEL
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'niveau_scolaires',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'niveau_scolaires',
    hooks: {
      beforeSave(ns,options){
        if(ns.isNewRecord){
          ns.active=true
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
    name_fr: {
      type: DataTypes.STRING,
      required: true,
      unique:true
    },
    name_ar: {
      type: DataTypes.STRING,
      required: true,
      unique:true
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
    }
  },
  associations:()=>{

  }


};
