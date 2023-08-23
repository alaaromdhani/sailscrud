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
                  annee_scolaire_id:{
                    [Op.ne]:as.id
                  }
                }
              })
               
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