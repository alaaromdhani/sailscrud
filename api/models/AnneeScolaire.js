const { DataTypes, Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")

module.exports = {
    options: {
        tableName: 'annee_scolaires',
        datastore: 'default',
        hooks:{
          beforeSave:async (as,options)=>{
            try{
              if(as.isNewRecord){
                as.active=false   
             }
             else if(as.changed('active') && as.active){
               await AnneeScolaire.update({active:false},{where:{
                   active:true,
                   id:{
                    [Op.ne]:as.id
                   } 
               }})
              
               await CartDetail.destory({where:{

               },truncate: true
              })
               await AnneeNiveauUser.update({
                 type:'archive',
 
               },{
                 where:{
                   annee_scolaire_id:{
                     [Op.ne]:as.id
                   }
                 }
               })
               /*let order_ids=(await AnneeNiveauUser.findAll({where:{
                   annee_scolaire_id:{
                     [Op.ne]:as.id,

                   },
                   order_id:{
                    [Op.ne]:null,
                   }
               }}))
               await Order.update({status:'expired'},{where:{
                 [Op.in]:order_ids.map(o=>o.id)
               }})*/
                
             }
            }catch(e){

              console.log(e)
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