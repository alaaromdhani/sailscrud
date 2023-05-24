const { DataTypes } = require("sequelize");



module.exports = {  
  options: {
    tableName: 'roles'
  },
  datastore: 'default',
  tableName: 'roles',
  attributes: {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
      },
      name: {
        type: DataTypes.STRING,
        required: true,
        unique: true,
        minLength: 1
      },
      weight: {
        type: DataTypes.INTEGER,
        required: true,
        unique: true,
       
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      
    },
    associations:()=>{
        Role.hasMany(User,{
            foreignKey:'role_id'

        })
        Role.belongsTo(User,{
            foreignKey:'updatedBy'


        })
        Role.belongsTo(User,{
            foreignKey:'addedBy'

        })
      
        Role.belongsToMany(Feature, { through: 'roles_features'});
        Role.belongsToMany(Permission, { through: 'roles_permissions'});
   


    }
  };
  