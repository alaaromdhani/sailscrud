const {
    DataTypes, Op 
  } = require('sequelize'); 
  module.exports = {
    options: {
      tableName: 'UserTokens'
    },
    attributes: {
      id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
      },
      token:{ type:DataTypes.STRING },
      tokenExpiredTime:{ type:DataTypes.DATE },
      isTokenExpired:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
      },
      isActive:{ type:DataTypes.BOOLEAN },
      isDeleted:{ type:DataTypes.BOOLEAN }
      
    },
    associations:()=>{
        
        
        UserToken.belongsTo(User,{
            foreignKey:'user_id',
            targetKey:'id'
  
  
        })
  
  
  
    }
  
  
      //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
      //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
      //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
  
  
      //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
      //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
      //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
  
  
      //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
      //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
      //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  
    
  
  };
  
  