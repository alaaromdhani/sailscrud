/**
 * @module MatiereNiveau
 *
 * @description
 *   its used as a join table between matiere and niveauscoleaire
 */
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'users_niveau_scolaires',
  options: {
    hooks:{
      beforeSave(mat_niveau,options){
          if(mat_niveau.isNewRecord){
            mat_niveau.name=""
          }
      }
    },
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    tableName: 'matieres_niveau_scolaires',
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
    nb_modules:{
      type:DataTypes.INTEGER,
      required:true

    }
  },
  associations:()=>{
      MatiereNiveau.belongsTo(Matiere,{
          foreignKey:'MatiereId'
      })
      MatiereNiveau.belongsTo(NiveauScolaire,{
        foreignKey:'NiveauScolaireId'
      })
      MatiereNiveau.belongsTo(User,{
        foreignKey:'intern_teacher',
        as:'Teacher'
      })
      MatiereNiveau.belongsTo(User,{
        foreignKey:'inspector',
        as:'Inspector'
      })
      MatiereNiveau.hasMany(Course,{
        foreignKey:'matiere_niveau_id'
      })
      MatiereNiveau.hasMany(Module,{
        foreignKey:'matiere_niveau_id'
      })

  }


};
