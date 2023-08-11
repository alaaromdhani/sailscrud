const { DataTypes } = require("sequelize");

/**
 * @module CoursVideo
 *
 * @description
 *   a child of a course (subcourse) that requires a video link with  vimeo or youtube
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'c_video',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
 
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
            course.active = false,
            course.validity = false,
            course.status = "private"
            course.rating =0
        }
        console.log('adding a course')
      },
      beforeDestroy:async(course,options)=>{
        await Rate.destroy({
          where:{c_video_id:course.id}
      })}

    },

  },
  tableName: 'c_video',
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
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    status:{
      type:DataTypes.ENUM('private','public'),
      defaultValue:'private',    
      allowNull:false
    },
    rating:{
      type:DataTypes.FLOAT,
      allowNull: false,
    },
    validity:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      allowNull:false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull:false,  
      defaultValue: false
    },
    source: {
        type: DataTypes.ENUM('youtube','vimeo'),
        required: true,
    },
      url: {
        type: DataTypes.STRING,
        required: true,
    },


  },
  associations:()=>{
    CoursVideo.belongsTo(Course,{
      foreignKey:'parent'
    })
    CoursVideo.belongsTo(User,{
      foreignKey:'addedBy'
    })
    CoursVideo.hasMany(Rate,{
      foreignKey:'c_video_id'
    })
    CoursVideo.hasMany(CoursComment,{
      foreignKey:'c_video_id'
    })

  }

};
