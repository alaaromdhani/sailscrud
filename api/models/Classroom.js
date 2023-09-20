const {
    DataTypes
  } = require('sequelize'); 
  
 
  
  module.exports = {
      options: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
        
            scopes: {},
            tableName: 'classrooms',
            hooks:{
               
            }
     
        },
    
    datastore: 'default',
    tableName: 'classrooms',
   
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
         },
    
      type:{
        type: DataTypes.ENUM('trial','halfpaid','paid'),
        defaultValue:'trial'
      }

        
     
      
      
    },
    associations : function(){
        Classroom.belongsTo(User,{
            foreignKey:'addedBy'
        })
        Classroom.belongsTo(NiveauScolaire,{
            foreignKey:'niveau_scolaire_id'
        })


    }
     // Can be omitted, so default sails.config.models.connection will be used
  };
  