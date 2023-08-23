const { DataTypes, Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")

module.exports = {
    options: {
        tableName: 'annee_scolaires',
        datastore: 'default',
        hooks:{
          beforeSave:async (as,options)=>{
            if(as.isNewRecord){
               as.active=false   
            }
            else if(as.changed('active') && as.active){
              await AnneeScolaire.update({active:false},{where:{
                  active:true 
              }})
              await AnneeNiveauUser.update({
                type:'archive',

              },{
                where:{
                  startingYear:{
                    [Op.lt]:as.startingYear
                  }
                }
              })
              let order_ids=(await AnneeNiveauUser.findAll({where:{
                  annee_scolaire:{
                    [Op.ne]:as.id
                  }
              }})).filter(a=>a.order_id!==null).map(a=>a.order_id)
              await Order.update({status:'expired'},{where:{
                [Op.in]:order_ids
              }})
               
            }


          }
        }
      },
      tableName: 'annee_scolaires',
      attributes: {
          id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
          },
          startingYear: {
              type: DataTypes.INTEGER,
          },
          endingYear: {
            type: DataTypes.INTEGER,
          },
          active:{
            type:DataTypes.BOOLEAN,
            defaultValue:false
          }
      },
      associations : function(){
        

  
          
       
  
    
      }



}