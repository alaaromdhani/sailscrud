const path = require("path");
const fs = require('fs')
const { DataTypes } = require("sequelize");

/**
 * @module OtherIntercative
 *
 * @description
 *   a child of a other_course (subcourse)
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'other_intercatives',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    indexes:[{
      unique:true,
      fields:["url"]
    },
    ],
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
          course.active = false,
          course.validity = false,
          course.status = "private"
          course.rating =0
        }
        course.thumbnail = sails.config.custom.baseUrl+'other/'+course.url+'/'+'story_content/thumbnail.jpg'

        console.log('adding a course')
      },
      beforeDestroy:async (course,options)=>{
        await CustomRate.destroy({
          where:{other_interactive_id:course.id}
          
        })
        await Obj.destroy({
            where:{
                other_interactive_id:course.id
            }
        })
        await ActivityState.destroy({
            where:{other_interactive_id:course.id}
        })
        await Statement.destroy({
            where:{other_interactive_id:course.id}
        })
       
        await CustomObject.destroy({
            where:{other_interactive_id:course.id}
        })
        const fullUrlPath = path.join(__dirname,'../../static/other/'+course.url)
        try{
          await new Promise((resolve,reject)=>{
            return fs.rmdir(fullUrlPath,{recursive:true},(err)=>{
                if(err){
                    return   reject(err)  
                  }
                  else{
                      return resolve()
                    }
            })
            
          })
          
        }
        catch(e){
          throw e
        }
       }
        

    },

  },
  tableName: 'other_intercatives',
  attributes: {
    id:{
      type:DataTypes.STRING,
      primaryKey:true,
    },
    url:{
      type: DataTypes.STRING,
      required: true,
      
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
    tracked:{
         type:DataTypes.BOOLEAN,
         defaultValue:false 
    },
    status:{
      type:DataTypes.ENUM(['public','private']),
      defaultValue:'private',    
      allowNull:false
    },
    thumbnail:{
      type:DataTypes.STRING,
      allowNull: true,
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
    nbQuestion:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    addedScript:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }


  },
  associations:()=>{
    OtherInteractive.belongsTo(OtherCourse,{
      foreignKey:'parent'
    })
    OtherInteractive.belongsTo(User,{
      foreignKey:'addedBy'
    })
    OtherInteractive.hasMany(CustomRate,{
      foreignKey:'other_interactive_id'
    })
    OtherInteractive.hasMany(ActivityState,{
      foreignKey:'other_interactive_id'
    })
   

  }

};
