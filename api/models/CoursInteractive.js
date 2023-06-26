const { DataTypes } = require("sequelize");

/**
 * @module CoursIntercative
 *
 * @description
 *   a child of a course (subcourse)
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'c_intercatives',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks: {
      beforeSave(course,options){
        if(course.isNewRecord){
          course.active = true
          course.rating =0
        }
        console.log('adding a course')
      },
      async beforeDestroy(course,options){
        await Rate.destroy({
          where:{course_id:course.id}
        })}

    },

  },
  tableName: 'c_intercatives',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    name: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 2
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating:{
      type:DataTypes.FLOAT,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },


  },
  associations:()=>{
    CoursInteractive.belongsTo(Course,{
      foreignKey:'parent'
    })
    CoursInteractive.belongsTo(User,{
      foreignKey:'addedBy'
    })
    CoursInteractive.belongsTo(Upload,{
      foreignKey:'org_file'
    })
    CoursInteractive.hasMany(Rate,{
      foreignKey:'c_interactive_id'
    })

  }

};
