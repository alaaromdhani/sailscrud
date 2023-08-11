/**
 * @module CoatchingVideo
 *
 * @description
 *   videos provided by links from youtube and vimoe.
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

/*
// event hooks => http://docs.sequelizejs.com/manual/tutorial/hooks.html
const eventCallback = () => { // items, options
  // do something like stringifying data...
};
*/

module.exports = {

  datastore: 'default',
  tableName: 'vcoachings',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
   
    scopes: {},
    tableName: 'vcoachings',
    hooks:{
        beforeCreate:(coachingVideo,options)=>{
            coachingVideo.isDeleted =false
        },
    }
  },
  attributes: {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        required: true,
      },
      description: {
        type: Sequelize.TEXT,
        required: true,
      },
      source: {
        type: DataTypes.ENUM('youtube','vimeo'),
        required: true,
      },
      url: {
        type: DataTypes.STRING,
        required: true,
      },
      isDeleted:{
        type:DataTypes.BOOLEAN,
      }

    },
    associations:()=>{
          CoachingVideo.belongsTo(User,{
              foreignKey:'addedBy'
          })
          CoachingVideo.belongsTo(Theme,{
            foreignKey:'theme_id'
          })
          CoachingVideo.hasMany(Rate,{
            foreignKey:'cv_id' 
          })
          
    }
};
