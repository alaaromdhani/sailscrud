/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of
 *                 how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

  const { DataTypes } = require('sequelize');

/*
// event hooks => http://docs.sequelizejs.com/manual/tutorial/hooks.html
const eventCallback = () => { // items, options
  // do something like stringifying data...
};
*/

module.exports = {
    attributes: {
       id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      
      email: {
        type: DataTypes.STRING,
      },
      
      password: {
        type: DataTypes.STRING,
      },
      
    },
      // Create relations
    associations: function() {
    },
    defaultScope: function() {
    },
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      classMethods: {},
      instanceMethods: {},
      hooks: {
             // beforeSave: eventCallback,
             // beforeValidate: eventCallback,
             // afterFind: eventCallback,
             // beforeBulkCreate: eventCallback,
             // beforeBulkUpdate: eventCallback,
           },
      scopes: {},
    },
    connection: 'default'    // Can be omitted, so default sails.config.models.connection will be used //
};
