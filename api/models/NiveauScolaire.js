/**
 * @module NiveauScolaire
 *
 * @description
 *   tells which level the student is
 *   PREDEFINED MODEL
 */
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const {NiveauScolaireShema} = require('../../utils/validations/NiveauScolaireSchema');

module.exports = {

  datastore: 'default',
  tableName: 'niveau_scolaires',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
   
    tableName: 'niveau_scolaires',
    hooks: {
      beforeSave(ns,options){
        if(ns.isNewRecord){
          ns.active=true
        }
      },
      async beforeDestroy(ns,options){
        await NiveauScolaire.sequelize.query(`DELETE FROM matieres_niveau_scolaires WHERE NiveauScolaireId =${ns.id}`);
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
    name_fr: {
      type: DataTypes.STRING,
      required: true,
    },
    name_ar: {
      type: DataTypes.STRING,
      required: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
    },
    order: {
      type: DataTypes.INTEGER,
    }
  },
  associations:()=>{
    NiveauScolaire.belongsToMany(Matiere,{
        through:MatiereNiveau
    })
    NiveauScolaire.belongsToMany(SoftSkills,{
      through:'soft_skills_ns'
    })
    NiveauScolaire.hasMany(Course,{
      foreignKey:'niveau_scolaire_id'
    })
    NiveauScolaire.belongsToMany(CType,{
      through:'types_ns'
    })
    
  }


};
