const { DataTypes } = require("sequelize");
const fs =require('fs');
const path = require("path");
/**
 * @module SoftSkillsInteractive
 *
 * @description
 *   soft skills related to a theme and requires a zip 
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'soft_skills_interactives',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    indexes:[{
      unique:true,
      fields:['url']
    },{
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
            course.thumbnail = sails.config.custom.baseUrl+'softskills/'+course.url+'/'+'story_content/thumbnail.jpg'
        }
        console.log('adding a course')
      },
      beforeDestroy:async(course,options)=>{
        await SoftSkillsRate.destroy({
          where:{sk_interactive_id:course.id}
      })
        await new Promise((resolve,reject)=>{
          fs.rmdir(path.join(__dirname,'../../static/softskills/'+course.url),{recursive:true},(err)=>{

            if(err){
              reject(err)
            }
            else{
              resolve()

            }
          })


        })
    
    
      }
        

    },

  },
  tableName: 'soft_skills_interactives',
  attributes: {
    id:{
      type:DataTypes.STRING,
      primaryKey:true,
    },
    thumbnail:{
      type:DataTypes.STRING,
      allowNull: true,
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
    url:{
        type: DataTypes.STRING,
        required: true,
        unique: true,   
    },


  },
  associations:()=>{
    SoftSkillsInteractive.belongsTo(SoftSkills,{
        foreignKey:'parent'
    })
    SoftSkillsInteractive.belongsTo(User,{
      foreignKey:'addedBy'
    })
    SoftSkillsInteractive.hasMany(SoftSkillsRate,{
      foreignKey:'sk_interactive_id'
    })
    

  }

};
