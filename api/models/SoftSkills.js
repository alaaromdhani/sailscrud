const { DataTypes } = require("sequelize");

/**
 * @module SoftSkills
 *
 * @description
 *   the parent of all soft skills 
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'soft_skills',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks: {
      beforeCreate: async (course,options)=>{
        if(course.isNewRecord){
          course.active = false
        }
        console.log('adding a parent soft skills')
      },
       beforeDestroy: async(course,options)=>{
        await SoftSkillsRate.destroy({
          where:{parent_sk:course.id}
        })}

    },

  },
  tableName: 'soft_skills',
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
      allowNull: true,
    },
    
    active: {
      type: DataTypes.BOOLEAN,
      allowNull:false,  
      defaultValue: false
    },

  },
  associations:()=>{
    SoftSkills.belongsTo(SoftSkillsTheme,{
      foreignKey:'theme_id'
    })
    SoftSkills.belongsToMany(NiveauScolaire,{
        through:'soft_skills_ns'
    })
    SoftSkills.hasMany(SoftSkillsDocument,{
      foreignKey:'parent'
    })
    
    SoftSkills.hasMany(SoftSkillsRate,{
        foreignKey:'parent_sk'
    })
    SoftSkills.hasMany(SoftSkillsVideo,{
      foreignKey:'parent'
    })
    SoftSkills.hasMany(SoftSkillsInteractive,{
      foreignKey:'parent'
    })

    
  }

};
