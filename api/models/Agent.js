const {
    DataTypes, Op 
  } = require('sequelize'); 


  
  
  
  module.exports = {
    options: {
      tableName: 'agents',
      indexes: [
        {
        unique: true,
        fields: ['mbox']
        },
        {
          unique: true,
          fields: ['account_name']
          }
        
      ]
      
    },
    datastore: 'default',
    tableName: 'agents',
    attributes: {
      id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
      },
      mbox:{
        type:DataTypes.STRING,
        allowNull:false
      },
      account_homepage:{ type:DataTypes.STRING,allowNull:false,
        },
        account_name:{ type:DataTypes.STRING,allowNull:false},
    },
    
        
     
    
    
    associations : function(){
      Agent.belongsTo(User,{
        foreignKey:'user_id'
      
      })
      Agent.hasMany(ActivityState,{
            foreignKey:'agent_id'
    })
      Agent.hasMany(Statement,{
        foreignKey:'agent_id'
      })
      Agent.hasMany(CustomObject,{
         foreignKey:'agent_id'       

      })
    }
     // Can be omitted, so default sails.config.models.connection will be used
  };
  