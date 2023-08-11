const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'prepaidcards',
     
    },
    datastore: 'default',
    tableName: 'prepaidcards',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false
            
        },
        nbre_cards:{
            type: DataTypes.INTEGER,
            allowNull:false

        },
        
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
       PrepaidCard.belongsTo(Upload,{
        foreignKey:'photo'
       })
       PrepaidCard.belongsTo(Pack,{
        foreignKey:'pack_id'
       })
       PrepaidCard.belongsTo(User,{
        foreignKey:'addedBy'
       })
       
       
       
      

        
     

  
    }
  };
  