const { DataTypes } = require('sequelize');
const getSlug = require('speakingurl')
/**
 * @module Blog
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {

  options: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    scopes: {},
    indexes:[
      
      {
        unique: true,
        fields: ['slug']
      }
    ],
    tableName: 'blogs',
    hooks:{
      beforeSave:async (blog, options)=>{
        if(blog.isNewRecord){
            blog.status =true
        }
        blog.slug = getSlug(blog.title)
      },
    }
  },
  datastore: 'default',
  tableName: 'blogs',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    title: {
      type: DataTypes.STRING,
      required: true,
      minLength: 1
    },

    slug: {
      type: DataTypes.STRING,
      required: true,
     
      minLength: 1
    },
    short_description: {
      type: DataTypes.TEXT,
      required: true,
      minLength: 10
    },
    description: {
      type: DataTypes.TEXT,
      required: true,
      minLength: 10
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull:false,
      minLength: 10
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull:false,
      minLength: 10
    },
    meta_keywords: {
      type: DataTypes.TEXT,
      allowNull:false,
      minLength: 10
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },






  },
  associations:()=>{
    Blog.belongsTo(BlogCategory,{
      foreignKey:'category_id'
    });
    Blog.belongsTo(User,{
      foreignKey:'addedBy'
    });
    Blog.belongsTo(Upload,{
      foreignKey:'banner',
      as:'Banner'
    });
    Blog.belongsTo(Upload,{
      foreignKey:'meta_img',
      as:'MetaImage'
    });



  }

};
