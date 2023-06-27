/**
 * @module Rate
 *
 * @description
 *   this model is responsible for giving the rate to a given course and it single for every User
 */

const { DataTypes } = require("sequelize");

module.exports = {

  options: {

    tableName: 'rates'
  },
  datastore: 'default',
  tableName: 'rates',
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
    Rate.belongsTo(User,{
        foreignKey:'ratedBy'
    })
    Rate.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
    })
    Rate.belongsTo(CoursDocument,{
      foreignKey:'c_document_id'
    })
    Rate.belongsTo(CoursVideo,{
      foreignKey:'c_video_id'
    })
    Rate.belongsTo(CoursInteractive,{
      foreignKey:'cv_id'
    })

  }





};
