/**
 * @module CoursComment
 *
 * @description
 *   this model represents the comments given by the intern teacher to some course 
 */

const { DataTypes } = require("sequelize");

module.exports = {

  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'coursecomments',
  },
  datastore: 'default',
  tableName: 'coursecomments',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    content: {
      type: DataTypes.TEXT, 
      required: true,
    },

  },
  associations : function(){
    CoursComment.belongsTo(User,{
        foreignKey:'addedBy'
    })
    CoursComment.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
    })
    CoursComment.belongsTo(CoursDocument,{
      foreignKey:'c_document_id'
    })
    CoursComment.belongsTo(CoursVideo,{
      foreignKey:'c_video_id'
    })
    CoursComment.belongsTo(Course,{
      foreignKey:'course_id'
    })

  }
}