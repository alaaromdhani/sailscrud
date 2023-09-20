const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      hooks:{
       
      },

      tableName: 'cart_details',
     
      
      
    },
    datastore: 'default',
    tableName: 'cart_details',
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
        isReducted:{
          type:DataTypes.BOOLEAN,
          allowNull:true
        }
        

        
    },
    associations : function(){
       CartDetail.hasMany(AnneeNiveauUser,{
        foreignKey:'cart_detail_id'
       })
       CartDetail.hasMany(TeacherPurchase,{
        foreignKey:'cart_detail_id'
       })
       CartDetail.belongsTo(Cart,{
        foreignKey:'cart_id'
       })
       CartDetail.belongsTo(Pack,{
        foreignKey:'pack_id'
       })
       CartDetail.belongsTo(User,{
        foreignKey:'addedBy'
       })
     }
  };
  