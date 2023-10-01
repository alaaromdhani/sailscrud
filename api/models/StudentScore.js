const { DataTypes } = require("sequelize");

/**
 * @module StudentScore
 *
 * @description
 *   represents the student score per school level per schoolyear .
 *   in order to do some statistics.
 */
module.exports = {
  options: {
    tableName: 'student_score'
  },
  datastore: 'default',
  tableName: 'student_score',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    currentScore: {
      type: DataTypes.FLOAT,
      defaultValue:0,
    },
  
    totalScore:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    
    
  },
  associations:()=>{
    StudentScore.belongsTo(User,{
        foreignKey:'user_id',
    })
    StudentScore.belongsTo(Matiere,{
        foreignKey:'matiere_id',
    })
    StudentScore.belongsTo(AnneeScolaire,{
        foreignKey:'annee_scolaire_id',
    })
    StudentScore.belongsTo(NiveauScolaire,{
        foreignKey:'niveau_scolaire_id',
    })
    StudentScore.belongsTo(CoursInteractive,{
        foreignKey:'c_interactive_id',
    })
    StudentScore.belongsTo(Trimestre,{
      foreignKey:'trimestre_id'
    })
   

  }

};