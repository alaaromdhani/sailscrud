/**
 * @module Theme
 *
 * @description
 *   used to categorise coatching videos.
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
      tableName: 'themes',
      options: {
        tableName: 'themes',
      

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
      }
    },
  associations:()=>{
      Theme.hasMany(CoachingVideo,{
        foreignKey:'theme_id'
      })
      Theme.belongsTo(User,{
          foreignKey:'addedBy'
      })
  }


};
