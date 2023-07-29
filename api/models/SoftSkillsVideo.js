const { DataTypes } = require("sequelize");

/**
 * @module SoftSkillsVideo
 *
 * @description
 *   a child of a course (subcourse) that requires a video link with  vimeo or youtube
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'soft_skills_video',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    indexes:[{
      unique:true,
      fields:['name']
    }],
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
        await SoftSkillsRate.destroy({
          where:{sk_video_id:course.id}
      })}

    },

  },
  tableName: 'soft_skills_video',
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
    SoftSkillsVideo.belongsTo(SoftSkillsTheme,{
      foreignKey:'theme_id'
    })
    SoftSkillsVideo.belongsTo(User,{
      foreignKey:'addedBy'
    })
    SoftSkillsVideo.hasMany(SoftSkillsRate,{
      foreignKey:'sk_video_id'
    })
    

  }

};
