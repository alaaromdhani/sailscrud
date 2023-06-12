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
    tableName: 'uploads'
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
      unique: true,
      minLength: 3
    },
    file_name: {
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
        unique: true,
        minLength: 1
    },
    
    
  },
  associations:()=>{
        Upload.belongsTo(User,{
            foreignKey:'addedBy'


        })
    

   

  }

};
