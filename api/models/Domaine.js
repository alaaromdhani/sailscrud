/**
 * @module Domaine
 *
 * @description
 *   a domain is attributed to a subject to globolize it
 *
 */

const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'domaines',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    indexes:[{
      unique:true,
      fields:['name']
    }],
    scopes: {},
    tableName: 'domaines',
    hooks: {
     
   

    }
  },

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      required: true,
    },
    color: {
      type: DataTypes.STRING,
      required: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue:true    
        //        required: true,
    },
  
  },
  associations:()=>{
        Domaine.hasMany(Matiere,{
            foreignKey:'domaine_id'
        })

  }


};
