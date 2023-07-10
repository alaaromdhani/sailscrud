/**
 * @module SoftSkillsTheme
 *
 * @description
 *   used to categorise softSkills.
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
      tableName: 'skills_themes',
      options: {
        tableName: 'skills_themes',

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
        unique:true
      },
      description: {
        type: Sequelize.TEXT,
        required: true,
      }
    },
  associations:()=>{
      
      SoftSkillsTheme.belongsTo(User,{
          foreignKey:'addedBy'
      })
  }


};
