const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},

      tableName: 'livraisons',
      indexes:[],
    },
    datastore: 'default',
    tableName: 'livraisons',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        status:{
            type:DataTypes.ENUM('expired','onhold','active'),
            defaultValue:'onhold'
        }

        
    },
    associations : function(){
       Livraison.belongsTo(Order,{
        foreignKey:'order_id'
       })
       Livraison.belongsTo(Adresse,{
        foreignKey:'adresse_id'
       })
       Livraison.belongsTo(User,{
        foreignKey:'addedBy'
       })
       
      
       
       
       
    }
  };
  