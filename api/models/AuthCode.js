/**
 * @module AuthCode
 *
 * @description
 *   sent to a user to verify his credentials, 
 */
const dayjs = require('dayjs');
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'authcodes',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'authcodes',
    hooks:{
      beforeSave:(code,options)=>{
        if(code.isNewRecord){
          const resendOptions = sails.config.custom.otpconf.resend.time
          code.resendTime= dayjs().add(resendOptions.value,resendOptions.unit)

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
    value: {
      type: DataTypes.STRING,
      required: true,
      
    },
    expiredDate:{
        type:DataTypes.DATE,
    },
    resendTime:{
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
