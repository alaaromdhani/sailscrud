/**
 * @module AuthCode
 *
 * @description
 *   sent to a user to verify his credentials, 
 */
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'authcodes',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'authcodes',

  },

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      required: true,
      
    },
    expiredDate:{
        type:DataTypes.DATE,
    },
    type:{
        type:DataTypes.ENUM('FORGET_PASSWORD','ACCOUNT_ACTIVATION'),
        required:true
    },
    numberAttempsResend:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    numberAttempsRetry:{
      type:DataTypes.INTEGER,
      defaultValue:0
   }


  },
  associations:()=>{
      AuthCode.belongsTo(User,{
        foreignKey:'user_id'
      })  
  }


};
