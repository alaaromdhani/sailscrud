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
    indexes: [
      {
        unique: true,
        fields: ['email','username','phonenumber']
      }
    ],
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'users',
    hooks:{
      beforeSave: async (user, options) => {
        if (user.changed('password') || user.isNewRecord) {
          if(user.isNewRecord){
              if(!user.isDeleted){
                user.isDeleted =false
              }
              else{
                user.isDeleted = true
              } 
          }
          user.password = await bcrypt.hash(user.password, 10);
        }
      },

      beforeCreate:async (user, options)=>{
        user.isDeleted = false;
      },
      beforeDestroy:async (user,options)=>{
        await User.sequelize.query(`DELETE FROM users_features WHERE UserId =`+user.id);
        await User.sequelize.query(`DELETE FROM users_permissions WHERE UserId =`+user.id);

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
      
     },
    profilePicture:{
      type:DataTypes.STRING,
      defaultValue:sails.config.custom.baseUrl+sails.config.custom.files.routes.public+sails.config.custom.dafault_user_image.file_name
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
      allowNull:true
    },
    preferredLanguage:{
      type:DataTypes.ENUM({values:['ar','fr','en']}),
      defaultValue:'ar'
    },
    sex:{
      type:DataTypes.ENUM({values:['M','F']}),
        allowNull:false,  
       defaultValue:'M',   
    },
    active:{
      type:DataTypes.BOOLEAN,
        allowNull:false,  
       defaultValue:true,   
    },
    username:{ type:DataTypes.STRING,allowNull:false,
       },
    phonenumber:{ type:DataTypes.STRING,allowNull:false,
      },
    password:{ type:DataTypes.STRING },
    isDeleted:{ type:DataTypes.BOOLEAN }




  },





  associations : function(){
    User.belongsToMany(Feature, { through: 'users_features'});
    User.belongsTo(Role,{
      foreignKey:'role_id'

    });

    User.hasMany(User,{
      as:'updatedUsers',
      foreignKey:'updatedBy',
      sourceKey:'id'

    });
    User.hasMany(User,{
      as:'addedUsers',
      foreignKey:'addedBy',
      sourceKey:'id'

    });


    User.belongsTo(User,{
      as:'adder',
      foreignKey:'addedBy',
      targetKey:'id'

    });
    User.belongsTo(User,{
      as:'updater',
      foreignKey:'updatedBy',
      targetKey:'id'

    });
    User.hasMany(Role,{
      foreignKey:'addedBy',
      sourceKey:'id'
    });
    User.hasMany(Role,{
      foreignKey:'updatedBy',
      sourceKey:'id'
    });

    User.hasMany(UserToken,{
      foreignKey:'user_id',
      sourceKey:'id'

    });

    User.hasMany(UserAuthSettings,{
      foreignKey:'user_id',
      sourceKey:'id'



    });
    User.hasMany(RequestLog,{
      foreignKey:'user_id'
    });
    User.belongsTo(State,{
      foreignKey:'state_id'
    });
    User.belongsTo(Country,{
      foreignKey:'country_id'
    });
    User.belongsToMany(Permission, { through: 'users_permissions'});
    User.hasMany(Upload,{
      foreignKey:'addedBy'

    });
    User.hasMany(Blog,{
      foreignKey:'addedBy'
    });
    User.hasMany(BlogCategory,{
      foreignKey:'addedBy'
    });
    User.hasMany(Rate,{
      foreignKey:'ratedBy'
    })
  }
  // Can be omitted, so default sails.config.models.connection will be used
};

