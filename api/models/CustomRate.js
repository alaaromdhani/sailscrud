/**
 * @module Rate
 *
 * @description
 *   this model is responsible for giving the rate to a given course and it single for every User
 */

const { DataTypes } = require("sequelize");

module.exports = {

  options: {

    tableName: 'custom_rates'
  },
  datastore: 'default',
  tableName: 'custom_rates',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    rating: {
      type: DataTypes.FLOAT,
      required: true,
      
    },

  },
  associations : function(){
    CustomRate.belongsTo(User,{
        foreignKey:'ratedBy'
    })
    CustomRate.belongsTo(OtherInteractive,{
        foreignKey:'other_interactive_id'
    })
    CustomRate.belongsTo(OtherDocument,{
      foreignKey:'other_document_id'
    })
    CustomRate.belongsTo(OtherVideo,{
      foreignKey:'other_video_id'
    })
    CustomRate.belongsTo(OtherCourse,{
      foreignKey:'other_course_id'
    })
    CustomRate.belongsTo(CType,{
        foreignKey:'c_type'
    })
    
      


  }





};
