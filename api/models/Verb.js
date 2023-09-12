const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'verbs',
     
    },
    
    datastore: 'default',
    tableName: 'verbs',
   
    attributes: {
      id:{
        type:DataTypes.STRING,
        primaryKey:true,
      },
      display:{
        type:DataTypes.STRING,
        allowNull:false
        
      }
        
     
      
      
    },
    associations : function(){
        Verb.hasMany(Statement,{
            foreignKey:'verb_id'
        })
    }
     // Can be omitted, so default sails.config.models.connection will be used
  };
  