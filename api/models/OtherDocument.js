const { DataTypes } = require("sequelize");

/**
 * @module OtherDocument
 *
 * @description
 *   a child of a othercourse (subcourse) that requires an upload of a document( pdf,word ..... )
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'other_documents',
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
      beforeDestroy:async (course,options)=>{
        await CustomRate.destroy({
          where:{other_document_id:course.id}
          
        })
      }
       

    },

  },
  tableName: 'other_documents',
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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull:false,  
      defaultValue: false
    },

  },
  associations:()=>{
    OtherDocument.belongsTo(OtherCourse,{
      foreignKey:'parent'
    })
    OtherDocument.belongsTo(User,{
      foreignKey:'addedBy'
    })
    OtherDocument.belongsTo(Upload,{
      foreignKey:'document'
    })
    OtherDocument.hasMany(CustomRate,{
        foreignKey:'other_document_id'
    })
   

  }

};
