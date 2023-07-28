/**
 * @module CType
 *
 * @description
 *   tells the type of the course,
 *   PREDEFINED MODEL
 */
const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'c_types',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
    hooks:{
      beforeSave:(type,options)=>{
        if(type.isNewRecord){
          type.rating = 0
          type.active = true
        }
      },
      beforeDestroy:async (type,options)=>{
       await CustomRate.destroy({
          where:{
            c_type:type.id
          }
        })

      }

    },
    tableName: 'c_types',

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
      unique:true
    },
    description: {
      type: DataTypes.STRING,
           
    },
    active: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue:false
    },
    free:{
      type:DataTypes.BOOLEAN,
      required:true,
      defaultValue:true
    },
    rating:{
      type:DataTypes.INTEGER,
      required:true,
      defaultValue:0
    },






  },
  associations:()=>{
      CType.belongsToMany(NiveauScolaire,{
          through:'types_ns'
      })
      CType.belongsTo(Upload,{
        foreignKey:'thumbnail'
      })
      CType.hasMany(OtherCourse,{
        foreignKey:'type'
      })
      CType.hasMany(CustomRate,{
        foreignKey:'c_type'
      })
      
  }


};
