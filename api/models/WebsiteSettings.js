const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      tableName: 'website_settings',
      indexes:[{
            unique:true,
            fields:['key']
      }]
    },
    datastore: 'default',
    tableName: 'website_settings',
    attributes: {
       id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
      },
      key:{
        type:DataTypes.STRING,
        allowNull:false
      },
      value:{
        type:DataTypes.TEXT,
        allowNull:false        
      }      
        
     
      
      
    },
    associations : function(){
        
    }
     // Can be omitted, so default sails.config.models.connection will be used
  };
  