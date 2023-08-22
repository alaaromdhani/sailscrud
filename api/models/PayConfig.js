const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'pay_configs',
      
      
    },
    datastore: 'default',
    tableName: 'pay_configs',
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
        
    },
    associations : function(){
       PayConfig.belongsTo(User,{
        foreignKey:'addedBy'
       })
       
    }
  };
  