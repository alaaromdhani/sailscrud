const { DataTypes } = require("sequelize");

/**
 * @module OtherVideo
 *
 * @description
 *   a child of a othercourse (subcourse) that requires a video link with  vimeo or youtube
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'other_videos',
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
        await CustomRate.destroy({
          where:{other_video_id:course.id}
      })}
      

    },

  },
  tableName: 'other_videos',
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
      defaultValue:0
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
    OtherVideo.belongsTo(OtherCourse,{
      foreignKey:'parent'
    })
    OtherVideo.belongsTo(User,{
      foreignKey:'addedBy'
    })
    OtherVideo.hasMany(CustomRate,{
        foreignKey:'other_video_id'
    })
    

  }

};
