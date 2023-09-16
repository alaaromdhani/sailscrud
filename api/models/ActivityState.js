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
      },
      indexes: [
            {
            unique: true,
            fields: ['registration']
            },
            {
                unique: true,
                fields: ['etag']
            }
      ]
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
            
        },
  
        etag:{
            type: DataTypes.STRING,
            
        },
        state: {
            type: DataTypes.BLOB,
            
        },
        deprecated:{
            type:DataTypes.BOOLEAN    
        },
        metadata:{
            type: DataTypes.STRING,
        },
        progression:{
            type:DataTypes.INTEGER,
            defaultValue:0
        
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
        foreignKey:'other_interactive_id',
        onDelete: 'CASCADE' 
       })
      

        
     

  
    }
  };
  