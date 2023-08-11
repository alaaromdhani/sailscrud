const { DataTypes } = require("sequelize");
const ValidationError = require("../../utils/errors/validationErrors");


/**
 * @module OtherCourse
 *
 * @description
 *   a custom course to be categorized.
 */
module.exports = {
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
          course.rating=0
          course.active = false
        }
      },
      beforeDestroy:async (course,options)=>{
        await CustomRate.destroy({
          where:{other_course_id:course.id}
          
        })
      }
      
      

    },


    tableName: 'othercourses'
  },
  datastore: 'default',
  tableName: 'othercourses',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    name: {
      type: DataTypes.STRING,
      required: true,
     
      minLength: 2
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    rating:{
      type:DataTypes.FLOAT,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
  




  },
  associations:()=>{
      OtherCourse.belongsTo(CType,{
          foreignKey:'type'
      })
      OtherCourse.hasMany(OtherInteractive,{
        foreignKey:'parent'
      })
      OtherCourse.hasMany(OtherVideo,{
        foreignKey:'parent'
      })
      OtherCourse.hasMany(OtherDocument,{
        foreignKey:'parent'
      })
      OtherCourse.hasMany(CustomRate,{
        foreignKey:'other_course_id'
      })
    
    
  }

};
