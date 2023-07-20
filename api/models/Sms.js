const {
    DataTypes, Op 
  } = require('sequelize'); 
const ValidationError = require('../../utils/errors/validationErrors');
const UnkownError = require('../../utils/errors/UnknownError');
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'sms',
      hooks:{
        beforeSave:async (sms,options)=>{
           console.log('sending sms ...' )
           try{
            await sails.services.otpservice.sendSms(sms)

           } 
           catch(e){
            throw new UnkownError(e)
           }

        }

      }
    },
    datastore: 'default',
    tableName: 'sms',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        content: {
            type: DataTypes.STRING,
            unique:true,
            allowNull:false
            
        },
        type:{
            type: DataTypes.ENUM('FORGETPASS','MARKETING'),
            allowNull:true
        },
        type_reciever: {
            type: DataTypes.ENUM('subscribers','group','single'),
            allowNull:false
        },
      
        
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
     Sms.belongsTo(Role,{
        foreignKey:'group_id'
     })
     Sms.belongsTo(User,{
        foreignKey:'reciever_id'
     })
     Sms.belongsTo(User,{
        foreignKey:'sender_id'
     })
     Sms.belongsTo(Subscriber,{
        foreignKey:'subscriber_id'
     })
       
       
       
      

        
     

  
    }
  };
  