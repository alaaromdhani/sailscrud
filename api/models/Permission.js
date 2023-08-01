/**
 * @module Permission
 *
 * @description
 *   The actions a Role is granted on a particular Model and its attributes
 */

const { DataTypes } = require("sequelize");

module.exports = {

  options: {
    tableName: 'permissions',
    
  },
  datastore: 'default',
  tableName: 'permissions',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    action: {
      type: DataTypes.ENUM('create','read','update','delete','validate','track'),
      required: true,
      /**
       * TODO remove enum and support permissions based on all controller
       * actions, including custom ones
       */

    },








  },





  associations : function(){

     Permission.belongsTo(Model,{
      foreignKey:'model_id'


     })
     Permission.belongsToMany(User, { through: 'users_permissions'});
     Permission.belongsToMany(Role, { through: 'roles_permissions'});









  }





};
