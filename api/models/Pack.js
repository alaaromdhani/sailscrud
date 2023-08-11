const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'packs',
      
      
    },
    datastore: 'default',
    tableName: 'packs',
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
        price:{
            type: DataTypes.FLOAT,
            allowNull:false
        },
        duration:{
          type: DataTypes.INTEGER,
          allowNull:false
        },
    },
    associations : function(){
       Pack.belongsTo(Upload,{
        foreignKey:'photo'
       })
       Pack.belongsTo(User,{
        foreignKey:'addedBy'
       })
       Pack.hasMany(PrepaidCard,{
        foreignKey:'pack_id'

       })

       
    }
  };
  