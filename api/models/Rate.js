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
    Rate.belongsTo(Course,{
        foreignKey:'course_id'
    })
    Rate.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id'
    })
  }





};
