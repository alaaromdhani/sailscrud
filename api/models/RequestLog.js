/**
* RequestLog.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const { DataTypes } = require("sequelize");


module.exports = {
  options: {
    tableName: 'requestlogs'
  },
  datastore: 'default',
  tableName: 'requestlogs',
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement: true
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    method: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING,
      isURL: true
    },
    body: {
      type: DataTypes.JSON
    },
   
  },
  associations:()=>{
    RequestLog.belongsTo(User,{

      foreignKey:'user_id'
    })
    RequestLog.belongsTo(Model,{

      foreignKey:'model_id'
    })

  }
};

