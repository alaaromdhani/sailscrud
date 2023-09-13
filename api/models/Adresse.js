const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},

      tableName: 'adresses',
      indexes:[],
    },
    datastore: 'default',
    tableName: 'adresses',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        adresse:{
            type:DataTypes.STRING,
            allowNull:false
        },
        postal_code:{
            type:DataTypes.STRING,
            allowNull:false 
         },
        phonenumber:{
            type:DataTypes.STRING,
            allowNull:true
        },


        
    },
    associations : function(){
       
        Adresse.belongsTo(State,{
            foreignKey:'state_id'
        })
       Adresse.belongsTo(User,{
        foreignKey:'addedBy'
       })
       Adresse.hasMany(Livraison,{
        foreignKey:'adresse_id'
       })
       
      
       
       
       
    }
  };
  