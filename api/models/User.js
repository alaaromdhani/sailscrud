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
      beforeSave: async (user, options) => {
        if (user.changed('password') || user.isNewRecord) {
          console.log(user.password);
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
     
      beforeCreate:async (user, options)=>{
        user.isDeleted = false
      },
      beforeDestroy:async (user,options)=>{
        await User.sequelize.query(`DELETE FROM users_features WHERE UserId =`+user.id)
        await User.sequelize.query(`DELETE FROM users_permissions WHERE UserId =`+user.id)
        
      

      },
      

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
    profilePicture:{
      type:DataTypes.STRING,
      defaultValue:sails.config.custom.baseUrl+"images/default.jpg"

    },
    firstName:{
      type:DataTypes.STRING,
      allowNull:false


    },
    lastName:{
      type:DataTypes.STRING,
      allowNull:false


    },
    birthDate:{
      type:DataTypes.DATE,
      allowNull:false

    }
    ,
    preferredLanguage:{
      type:DataTypes.ENUM({values:['ar','fr','en']}),
      defaultValue:'ar'


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
    User.belongsTo(State,{
      foreignKey:'state_id'
    })
    User.belongsTo(Country,{
      foreignKey:'country_id'
    })
    User.belongsToMany(Permission, { through: 'users_permissions'});
    User.hasMany(Upload,{
      foreignKey:'addedBy'

    })
     

  }
   // Can be omitted, so default sails.config.models.connection will be used
};

