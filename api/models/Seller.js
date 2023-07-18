const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'sellers'
    },
    datastore: 'default',
    tableName: 'sellers',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: {
            type: DataTypes.STRING,
            unique:true,
            allowNull:false
            
        },
        address: {
            type: DataTypes.STRING,
            unique:true,
            allowNull:false
        },
        postal_code:{
            type: DataTypes.STRING,
            allowNull:false

        },
        phone_number:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false
        }
        
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
       Seller.belongsTo(State,{
            foreignKey:'state_id'
       })
       Seller.belongsTo(User,{
        foreignKey:'addedBy'
       })
       
       
       
      

        
     

  
    }
  };
  