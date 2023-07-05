const { DataTypes } = require("sequelize");

/**
 * @module CoursDocument
 *
 * @description
 *   a child of a course (subcourse) that requires an upload of a document( pdf,word ..... )
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'c_documents',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks: {
      beforeCreate: async (course,options)=>{
        if(course.isNewRecord){
          course.active = false,
          course.validity = false,
          course.status = "private"
          course.rating =0
        }
        console.log('adding a course')
      },
       beforeDestroy: async(course,options)=>{
        await Rate.destroy({
          where:{c_document_id:course.id}
        })}

    },

  },
  tableName: 'c_documents',
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
    
    status:{
      type:DataTypes.ENUM(['public','private']),
      defaultValue:'private',    
      allowNull:false
    },
    rating:{
      type:DataTypes.FLOAT,
      allowNull: true,
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

  },
  associations:()=>{
    CoursDocument.belongsTo(Course,{
      foreignKey:'parent'
    })
    CoursDocument.belongsTo(User,{
      foreignKey:'addedBy'
    })
    CoursDocument.belongsTo(Upload,{
      foreignKey:'document'
    })
    CoursDocument.hasMany(Rate,{
      foreignKey:'c_document_id'
    })
    CoursDocument.hasMany(CoursComment,{
      foreignKey:'c_document_id'
    })

  }

};
