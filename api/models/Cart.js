const {
    DataTypes 
  } = require('sequelize'); 
  
  
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      
      tableName: 'carts',
     
      
      
    },
    datastore: 'default',
    tableName: 'carts',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        
       
        price:{
            type:DataTypes.FLOAT,
            allowNull:true
        },
        priceAfterReduction:{
          type:DataTypes.FLOAT,
          allowNull:true
        },
        

        
    },
    associations : function(){
       Cart.hasMany(CartDetail,{
        foreignKey:'cart_id'
       })
       Cart.hasMany(AnneeNiveauUser,{
        foreignKey:'cart_id'
       })
       Cart.belongsTo(User,{
        foreignKey:'addedBy'
       })
     }
  };
  