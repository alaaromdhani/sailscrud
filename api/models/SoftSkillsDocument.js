const { DataTypes } = require("sequelize");

/**
 * @module SoftSkillsDocument
 *
 * @description
 *   a child of a course (subcourse) that requires an upload of a document( pdf,word ..... )
 */
module.exports = {
  datastore: 'default',
  options: {
    tableName: 'sk_documents',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks: {
      beforeCreate: async (course,options)=>{
        if(course.isNewRecord){
          course.active = false,
          course.validity = false,
          course.status = "private"
          course.rating =0
        }
        console.log('adding a course')
      },
       beforeDestroy: async(course,options)=>{
        await SoftSkillsRate.destroy({
          where:{sk_document_id:course.id}
        })}

    },

  },
  tableName: 'sk_documents',
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
    
    status:{
      type:DataTypes.ENUM(['public','private']),
      defaultValue:'private',    
      allowNull:false
    },
    rating:{
      type:DataTypes.FLOAT,
      allowNull: true,
    },
    validity:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      allowNull:false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull:false,  
      defaultValue: false
    },

  },
  associations:()=>{
    SoftSkillsDocument.belongsTo(SoftSkillsTheme,{
      foreignKey:'theme_id'
    })
    SoftSkillsDocument.belongsTo(User,{
      foreignKey:'addedBy'
    })
    SoftSkillsDocument.belongsTo(Upload,{
      foreignKey:'document'
    })
    SoftSkillsDocument.hasMany(SoftSkillsRate,{
      foreignKey:'sk_document_id'
    })
    
  }

};
