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
    indexes:[{
      unique:true,
      fields:['name_fr']
    },{
      unique:true,
      fields:['name_ar']
    }],

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
    
    },
    name_ar: {
      type: DataTypes.STRING,
      required: true,

    },
    isSummerSchool:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    startDay:{
      type:DataTypes.INTEGER,
    },
    endDay:{
      type:DataTypes.INTEGER,
    },
    startMonth:{
      type:DataTypes.INTEGER,
    },
    endMonth:{
      type:DataTypes.INTEGER,
    },
    active:{
      type:DataTypes.BOOLEAN
    }

  },
  associations:()=>{
    Trimestre.belongsToMany(Module,{
      through:'trimestres_modules'
    })
    
  }


};
