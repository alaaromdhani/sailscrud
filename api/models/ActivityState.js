const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'activitystates'
    },
    datastore: 'default',
    tableName: 'activitystates',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        registration: {
            type: DataTypes.STRING,
            unique:true
        },
  
        etag:{
            type: DataTypes.STRING,
            unique:true
        },
        state: {
            type: DataTypes.BLOB,
            
        },
        
        metadata:{
            type: DataTypes.STRING,
        }
    },
    associations : function(){
       ActivityState.belongsTo(Agent,{
        foreignKey:'agent_id',
        onDelete: 'CASCADE'
       })
       ActivityState.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id',
        onDelete: 'CASCADE' 
       })
      

        
     

  
    }
  };
  