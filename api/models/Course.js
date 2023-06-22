const { DataTypes } = require("sequelize");

/**
 * @module Course
 *
 * @description
 *   a course to be categorized.
 */
module.exports = {
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks:{
      beforeSave(course,options){
        if(course.isNewRecord){
            course.active = true
            course.rating =0
        }
      },
      beforeDestroy(){


      }

    },
    tableName: 'courses'
  },
  datastore: 'default',
  tableName: 'courses',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    name: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
      minLength: 2
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating:{
      type:DataTypes.FLOAT,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },


  },
  associations:()=>{
    Course.belongsTo(NiveauScolaire, {
      foreignKey:'niveau_scoleaire_id'
    });
    Course.belongsTo(Chapitre, {
      foreignKey:'chapitre_id'
    });
    Course.belongsTo(Matiere, {
      foreignKey:'matiere_id'
    });
  }

};
