/**
 * @module Card
 *
 * @description
 *   one element of prepaid cards
 *   PREDEFINED MODEL
 */

const { DataTypes } = require('sequelize');

module.exports = {

  datastore: 'default',
  tableName: 'cards',
  options: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    scopes: {},
  
    hooks:{
        beforeDestroy:async (c,options)=>{
                let serie = await PrepaidCard.findByPk(c.serie_id)
                serie.nbre_cards = serie.nbre_cards-1
                await serie.save()

        }

    },
    tableName: 'cards',

  },
  

  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      required: true,
    },
    used: {
      type: DataTypes.STRING,
      defaultValue:false,
    }
    

  },
  associations:()=>{
      Card.belongsTo(PrepaidCard,{
        foreignKey:'serie_id'
      })
      Card.belongsTo(User,{
        foreignKey:'addedBy',
      
      })
      Card.belongsTo(Livraison,{
        foreignKey:'livraison_id'
      })
      Card.belongsTo(Order,{
        foreignKey:'order_id'
      })
  }


};
