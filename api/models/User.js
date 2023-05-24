/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const {
  DataTypes, Op 
} = require('sequelize'); 

const bcrypt = require('bcrypt');

module.exports = {
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'users',
    hooks:{
      beforeSave:async (user,options)=>{
        user.password = await bcrypt.hash(user.password,10)

      },
      beforeDestroy:(user,options)=>{
        console.log('deleted user with id ='+user.id)

      }

    }
  },
  datastore: 'default',
  tableName: 'users',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    email:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true


    },

    username:{ type:DataTypes.STRING,allowNull:false,
      unique:true },
      phonenumber:{ type:DataTypes.STRING,allowNull:false,
        unique:true },
    password:{ type:DataTypes.STRING },
    isDeleted:{ type:DataTypes.BOOLEAN }

   
    
    
  },

  
    
  
  
  associations : function(){
    User.belongsToMany(Feature, { through: 'users_features'});
    User.belongsTo(Role,{
      foreignKey:'role_id'
    
    })
    
    User.hasMany(User,{
      as:'updatedUsers',
      foreignKey:'updatedBy',
      sourceKey:'id'

    })
    User.hasMany(User,{
      as:'addedUsers',
      foreignKey:'addedBy',
      sourceKey:'id'

    })
    
    
    User.belongsTo(User,{
      as:'adder',
      foreignKey:'addedBy',
      targetKey:'id'

    })
    User.belongsTo(User,{
      as:'updater',
      foreignKey:'updatedBy',
      targetKey:'id'

    })
    User.hasMany(Role,{
      foreignKey:'addedBy',
      sourceKey:'id'
    })
    User.hasMany(Role,{
      foreignKey:'updatedBy',
      sourceKey:'id'
    })

    User.hasMany(UserToken,{
        foreignKey:'user_id',
        sourceKey:'id'

    })
    
    User.hasMany(UserAuthSettings,{
      foreignKey:'user_id',
      sourceKey:'id'



    })
    User.hasMany(RequestLog,{
      foreignKey:'user_id'
    })
    User.belongsToMany(Permission, { through: 'users_permissions'});
     

  }
   // Can be omitted, so default sails.config.models.connection will be used
};

