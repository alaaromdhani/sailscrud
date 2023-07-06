const {
    DataTypes, Op 
  } = require('sequelize'); 

  
 
  
  module.exports = {
    options: {
      tableName: 'statements'
    },
    datastore: 'default',
    tableName: 'statements',
    attributes: {
    id:{
        type:DataTypes.STRING,
        primaryKey:true,
      },
      timeStamp:{
        type: DataTypes.DATE,
      },
  
      duration:{
        type: DataTypes.STRING
      },
      jsonData:{
        type:DataTypes.JSON


      }

        
     
      
      
    },
    
        
     
    
    
    associations : function(){
       Statement.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
      
      })
      Statement.belongsTo(Obj,{
        foreignKey:'obj_id'
      })
      Statement.belongsTo(Verb,{
        foreignKey:'verb_id'
      })
      Statement.belongsTo(Agent,{
        foreignKey:'agent_id'

      })
      Statement.belongsTo(CustomObject,{
        foreignKey:'custom_object_id'
      })

      

        
     

  
    }
     // Can be omitted, so default sails.config.models.connection will be used
  };
  