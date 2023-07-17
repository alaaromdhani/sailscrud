/**
 * @module Module
 *
 * @description
 *   a module is a subchaptre which means that a chapter many modules
 */

const { DataTypes } = require('sequelize');



module.exports = {

  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'modules',
  },
  datastore: 'default',
  tableName: 'modules',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    name: {
      type:DataTypes.STRING,
      required: true,
      minLength: 1
    },
    






  },





  associations : function(){
    Module.belongsTo(Chapitre,{
      foreignKey:'chapitre_id'
    })
    Module.belongsTo(MatiereNiveau,{
      foreignKey:'matiere_niveau_id'
    })
    Module.hasMany(Course,{
        foreignKey:'module_id'
    })
    Module.belongsToMany(Trimestre,{
      through:'trimestres_cours'
    })
  }



};
