const { DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
/**
 * @module Upload
 *
 * @description
 *   uploads for media library
 *   this feature enable users to manage documents in the media library
 */

module.exports = {
  options: {
    tableName: 'uploads',
    hooks:{
      beforeDestroy: async(upload,options)=>{
        if(upload.isPublic){
          await User.update({profilePicture:sails.config.custom.baseUrl+sails.config.custom.files.routes.public+sails.config.custom.dafault_user_image.file_name},{where:{profilePicture:upload.link}});
        }
        fs.unlink(path.join(__dirname,'../../assets/'+upload.path+'/'+upload.file_name+'.'+upload.extension),err=>{
          if(!err){
            console.log('file is deleted successuflly');
          }
          else{
            console.log('file could not be deleted ',err);
          }

        });


      }



        // Make sure to return a Promise or use async/await

      ,
      beforeSave: async (upload, options) => {
        upload.isDeleted = false
        if(upload.isPublic){
          upload.link = sails.config.custom.baseUrl+'v/public/'+upload.file_name;
        }
        else{
          upload.link = sails.config.custom.baseUrl+'v/uploads/'+upload.file_name;
        }
        upload.file_original_name = upload.file_original_name.replace('.'+upload.extension,'');

        },
      beforeUpdate: async (upload, options) => {
        if(upload.isPublic){
          upload.link = sails.config.custom.baseUrl+'v/public/'+upload.file_name;
        }
        else{
          upload.link = sails.config.custom.baseUrl+'v/uploads/'+upload.file_name;
        }
        upload.file_original_name = upload.file_original_name.replace('.'+upload.extension,'');
      },


    }
  },

  datastore: 'default',
  tableName: 'uploads',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    file_original_name: {
      type: DataTypes.STRING,
      required: true,
      minLength: 3
    },
    link: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 3
    },
    isPublic:{
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    },
    path:{ //meaning from assets
      type: DataTypes.STRING,
      required: true,
      minLength: 3
    },
    file_name: {//the uuid
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 3
    },
    type: {
      type: DataTypes.STRING,
      required: true,
      minLength: 3
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    extension: {
      type: DataTypes.STRING,
      required: true,
      minLength: 1
    },
    isDeleted:{
      type: DataTypes.BOOLEAN,
      defaultValue:false,
    }
  },
  associations:()=>{
    Upload.belongsTo(User,{
      foreignKey:'addedBy'
    });
  }

};
