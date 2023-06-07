const { DataTypes } = require("sequelize");

/**
 * @module Feature
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {
  options: {
    tableName: 'states'
  },
  datastore: 'default',
  tableName: 'states',
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
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
  },
  associations:()=>{
    State.belongsTo(Country,{
        foreignKey:'country_id'

    })
    State.hasMany(User,{
        foreignKey:'state_id'
    })
    
   

  }

};