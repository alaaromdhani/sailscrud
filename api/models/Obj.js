const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'objs'
    },
    datastore: 'default',
    tableName: 'objs',
    attributes: {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
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
        isCustom:{
            defaultValue:false,
            type: DataTypes.BOOLEAN,
        },
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
       Obj.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
       })
       Obj.hasMany(Statement,{
        foreignKey:'obj_id'
        })
       
       
      

        
     

  
    }
  };
  