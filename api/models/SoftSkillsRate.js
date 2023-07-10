/**
 * @module SoftSkillsRate
 *
 * @description
 *   this model is responsible for giving the rate to a given course and it single for every User
 */

const { DataTypes } = require("sequelize");


module.exports = {

  options: {

    tableName: 'sk_rates'
  },
  datastore: 'default',
  tableName: 'sk_rates',
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
    SoftSkillsRate.belongsTo(User,{
        foreignKey:'ratedBy'
    })
    SoftSkillsRate.belongsTo(SoftSkillsInteractive,{
        foreignKey:'sk_interactive_id'
    })
    SoftSkillsRate.belongsTo(SoftSkillsVideo,{
      foreignKey:'sk_video_id'
    })
    SoftSkillsRate.belongsTo(SoftSkillsDocument,{
        foreignKey:'sk_document_id'
    })
    

  }





};
