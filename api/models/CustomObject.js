const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'custom_objects'
    },
    datastore: 'default',
    tableName: 'custom_objects',
    attributes: {
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        und: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            
        },
        name:{
            type: DataTypes.STRING,

        },
        description:{
            type: DataTypes.STRING,
        },
    },
    
        
     
    
    
    associations : function(){
       CustomObject.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
       })
       CustomObject.hasMany(Statement,{
        foreignKey:'custom_object_id'
       })
       CustomObject.belongsTo(Agent,{
        foreignKey:'agent_id'
       })

       
       
      

        
     

  
    }
  };
  