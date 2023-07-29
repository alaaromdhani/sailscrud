const { DataTypes } = require("sequelize");
const ValidationError = require("../../utils/errors/validationErrors");


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
    indexes:[{
      unique:true,
      fields:['name']
    }],
    hooks: {
      beforeSave:(course,options)=>{
        if(course.isNewRecord){
          course.rating=0
          course.active = false
        }
        if (course.order && course.module_id&& !course.trimestre_id){
         
          course.type ="cours"
        }
        else if (!course.order && !course.module_id&& course.trimestre_id){
          course.type ="exam"
        }
        else{
          throw new ValidationError({message:'valid configuration is required'})
        }

        
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
      allowNull:true
    },
    type:{
      type:DataTypes.STRING,
      allowNull:true
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
    Course.belongsTo(Trimestre,{
      foreignKey:'trimestre_id'
    })
    Course.belongsTo(MatiereNiveau,{
      foreignKey:'matiere_niveau_id'
    })
    Course.hasMany(CoursInteractive,{
      foreignKey:'parent'
    })
    Course.hasMany(CoursDocument,{
      foreignKey:'parent'
    })
    Course.hasMany(CoursVideo,{
      foreignKey:'parent'
    })
    
  }

};
