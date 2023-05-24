const { DataTypes } = require("sequelize");

/**
 * @module Feature
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {
  options: {
    tableName: 'features'
  },
  datastore: 'default',
  tableName: 'features',
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
    description: {
      type: DataTypes.STRING,
      minLength: 1,
      allowNull: true
    },
    identity: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 1
    },
    context: {
      type: DataTypes.STRING,
      required: false,
      minLength: 1,
      defaultValue: "default"
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
  },
  associations:()=>{

    Feature.belongsToMany(User, { through: 'users_features'});
    
    Feature.belongsToMany(Role, { through: 'roles_features'});

   

  }

};
