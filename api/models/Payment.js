const {
    DataTypes
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'payements',
      
      
    },
    datastore: 'default',
    tableName: 'payements',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        amount: {
            type: DataTypes.FLOAT,
           
            allowNull:false
        },
        
       
    },
    associations : function(){
      Payment.belongsTo(Seller,{
        foreignKey:'seller_id'
      }) 
      Payment.belongsTo(User,{
        foreignKey:'addedBy',
        as:'Adder'
      })
      Payment.belongsTo(User,{
        foreignKey:'updatedBy',
        as:'Updater'
      })
       
    }
  };
  