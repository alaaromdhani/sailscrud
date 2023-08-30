const {
    DataTypes, Op 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},
      tableName: 'card_series',
      hooks:{
        beforeSave:async (s,options)=>{
        // console.log(Object.keys(s),s.isNewRecord)
          
          if(!s.isNewRecord && s.changed('nbre_cards')){
            let cards =await Card.findAll({where:{
              serie_id:s.id 
            }})
            if(s.nbre_cards>cards.length){
                await sails.services.payementservice.createCards(s.id,(s.nbre_cards-cards.length),s.addedBy)  
            }
            else{
             
              let cardsIdToDelete = []
              for(let i=cards.length-1;i>=s.nbre_cards;i--){
                  cardsIdToDelete.push(cards[i].dataValues.id)
              } 
              await Card.destroy({where:{
                id:{
                  [Op.in]:cardsIdToDelete
                }
              }}) 
            }    
          }

        }
      }
    },
    datastore: 'default',
    tableName: 'card_series',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false
            
        },
        nbre_cards:{
            type: DataTypes.INTEGER,
            allowNull:false

        },
        
        
     
      
      
    },
    
        
     
    
    
    associations : function(){
       PrepaidCard.belongsTo(Upload,{
        foreignKey:'photo'
       })
       PrepaidCard.belongsTo(Pack,{
        foreignKey:'pack_id'
       })
       PrepaidCard.belongsTo(User,{
        foreignKey:'addedBy'
       })
       PrepaidCard.belongsTo(Seller,{
        foreignKey:'seller_id'
       })
       
       
       
      

        
     

  
    }
  };
  