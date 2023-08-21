const path = require("path");
const fs = require('fs')
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
    indexes:[
    {
      unique:true,
      fields:['url']
    }],
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
          course.active = false,
          course.validity = false,
          course.status = "private"
          course.rating =0
        }
        course.thumbnail = sails.config.custom.baseUrl+'courses/'+course.url+'/'+'story_content/thumbnail.jpg'

        console.log('adding a course')
      },
      beforeDestroy:async (course,options)=>{
        await Rate.destroy({
          where:{c_interactive_id:course.id}
          
        })
        await Obj.destroy({
            where:{
                c_interactive_id:course.id
            }
        })
        const fullUrlPath = path.join(__dirname,'../../static/courses/'+course.url)
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
  tableName: 'c_intercatives',
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
    tracked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    order:{
      type: DataTypes.INTEGER,
      allowNull:false
    },

    



  },
  associations:()=>{
    CoursInteractive.belongsTo(Course,{
      foreignKey:'parent'
    })
    CoursInteractive.belongsTo(User,{
      foreignKey:'addedBy'
    })
    CoursInteractive.hasMany(Rate,{
      foreignKey:'c_interactive_id'
    })
    CoursInteractive.hasMany(CoursComment,{
      foreignKey:'c_interactive_id'
    })
    

  }

};
