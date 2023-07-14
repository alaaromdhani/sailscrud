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
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
          course.active = true
          course.rating =0
        }
        console.log('adding a course')
      },
      beforeDestroy:async (course,options)=>{
        await Rate.destroy({
          where:{course_id:course.id}
        })
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
    order:{
      type:DataTypes.INTEGER,
      required:true
    }


  },
  associations:()=>{
    Course.belongsTo(NiveauScolaire, {
      foreignKey:'niveau_scolaire_id'
    });
    Course.belongsTo(Module, {
      foreignKey:'module_id'
    });
    Course.belongsTo(Matiere, {
      foreignKey:'matiere_id'
    });
    Course.belongsTo(User,{
      foreignKey:'addedBy'
    })
    Course.belongsToMany(Trimestre,{
      through:'trimestres_cours'
    })
    Course.belongsTo(MatiereNiveau,{
      foreignKey:'matiere_niveau_id'
    })
  }

};
