const { DataTypes } = require("sequelize");

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
      beforeSave: async (upload, options) => {
        if(upload.isPublic){
          upload.link = sails.config.custom.baseUrl+'v/public/'+upload.file_name
        }
        else{
          upload.link = sails.config.custom.baseUrl+'v/uploads/'+upload.file_name
        }
        upload.file_original_name = upload.file_original_name.replace('.'+upload.extension,'')
      },
      beforeUpdate: async (upload, options) => {
        if(upload.isPublic){
          upload.link = sails.config.custom.baseUrl+'v/public/'+upload.file_name
        }
        else{
          upload.link = sails.config.custom.baseUrl+'v/uploads/'+upload.file_name
        }
        upload.file_original_name = upload.file_original_name.replace('.'+upload.extension,'')
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
        })
  }

};
