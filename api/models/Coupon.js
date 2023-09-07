const { DataTypes } = require('sequelize');

/**
 * @module Coupons
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {

  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
   
    scopes: {},
    tableName: 'coupons'
  },
  datastore: 'default',
  tableName: 'coupons',
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    code: {
      type: DataTypes.STRING,
      required: true,

    },

    limit:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    used: {
      type: DataTypes.INTEGER,
      defaultValue:0  
    },
    reduction:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    expiredDate:{
      type:DataTypes.DATE,
      allowNull:true
   },
    
    type:{
      type:DataTypes.ENUM('percentage','ammount'),
      defaultValue:'percentage'
    }



    

  },
  associations:()=>{
    Coupon.belongsTo(User,{
        foreignKey:'addedBy'
    })
    Coupon.hasMany(Order,{
      foreignKey:'coupon_id'
    })






  }

};
