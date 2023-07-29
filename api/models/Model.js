/**
 * @module Model
 *
 * @description
 *   Abstract representation of a Waterline Model.
 */

const { DataTypes } = require('sequelize');


//let _ = require('lodash');
//after creating this model i have to pick the attributes that should be visible in find operations

module.exports = {

  options: {
    tableName: 'models',
    indexes:[{
      unique:true,
      fields:['name']
    }],
  },
  datastore: 'default',
  tableName: 'models',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    name: {
      type:DataTypes.STRING,
      required: true,
      minLength: 1
    },
    identity: {
      type:DataTypes.JSON,
      minLength: 1
    },
    attributes: {
      type:DataTypes.JSON
    },






  },





  associations : function(){

    Model.hasMany(Permission,{
      foreignKey:'model_id'


    });
    Model.hasMany(RequestLog,{
      foreignKey:'model_id'
    });









  }



};
