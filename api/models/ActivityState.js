const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'activitystates',
      hooks:{
           beforeSave:(activityState,options)=>{
            if(activityState.isNewRecord){
                activityState.deprecated = false
            }
            
          },
      }
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
        deprecated:{
            type:DataTypes.BOOLEAN    
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
       ActivityState.belongsTo(OtherInteractive,{
        foreignKey:'other_intercative_id',
        onDelete: 'CASCADE' 
       })
      

        
     

  
    }
  };
  