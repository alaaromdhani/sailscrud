const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},

      tableName: 'orders',
      indexes:[{
        unique:true,
        fields:['orderId']
      },{
        unique:true,
        fields:['code']
      }],
      
      
    },
    datastore: 'default',
    tableName: 'orders',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        code: {
            type: DataTypes.STRING,
            allowNull:false
        },
        orderId:{
            type: DataTypes.STRING,
            allowNull:false
        },
        price:{
            type:DataTypes.FLOAT,
            allowNull:false

        }

        
    },
    associations : function(){
       Order.belongsToMany(Pack,{
        through:'orders_packs'
       })
       Order.belongsTo(Trimestre,{
        through:'orders_trimestres'
       })
      
       Order.belongsTo(PayConfig,{
        foreignKey:'payment_type_id'
       })
       Order.belongsTo(User,{
        foreignKey:'addedBy'
       })
       Order.belongsTo(AnneeNiveauUser,{
        foreignKey:'annee_niveau_user_id'
       })
       
       
    }
  };
  