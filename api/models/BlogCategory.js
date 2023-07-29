const { DataTypes } = require("sequelize");
const getSlug = require("speakingurl")
/**
 * @module BlogCategory
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {
  options: {
    tableName: 'blog_categories',
      hooks:{
          async beforeSave(blogCategory,options){
            blogCategory.slug = getSlug(blogCategory.category_name)
          }
      },
      indexes:[
        {
          unique: true,
          fields: ['category_name','slug']
        }
      ],
  },
  datastore: 'default',
  tableName: 'blog_categories',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    category_name: {
      type: DataTypes.STRING,
      required: true,
     
      minLength: 1
    },

    slug: {
      type: DataTypes.STRING,
      required: true,
      
      minLength: 1
    },



  },
  associations:()=>{
    BlogCategory.hasMany(Blog,{
        foreignKey:'category_id'
    })
    BlogCategory.belongsTo(User,{
        foreignKey:'addedBy'
    })





  }

};
