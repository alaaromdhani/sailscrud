/**
 * @module Matiere
 *
 * @description
 *   la matière d'étude et peut etre la meme pour plusieur niveau
 *
 */

const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'matieres',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    
    tableName: 'matieres',
    hooks: {
      beforeSave(matiere,options){
          if(matiere.isNewRecord){
              matiere.active=true
          }
      },
      async beforeDestroy(matiere,options){
        await Matiere.sequelize.query(`DELETE FROM matieres_niveau_scolaires WHERE MatiereId =${matiere.id}`);
      }

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
    description: {
      type: DataTypes.STRING,
      required: true,
    },
    color: {
      type: DataTypes.STRING,
      required: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    rtl:{
      type:DataTypes.BOOLEAN,
      defaultValue:true

    }
  },
  associations:()=>{
      Matiere.belongsTo(Upload,{
        foreignKey:'image'
      })
      Matiere.belongsToMany(NiveauScolaire,{
        through:MatiereNiveau
      })
      Matiere.belongsTo(Domaine,{
        foreignKey:'domaine_id'
      })
      Matiere.hasMany(Course,{
        foreignKey:'matiere_id'
      })

  }


};
