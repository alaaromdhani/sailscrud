const { DataTypes } = require("sequelize")
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
               const activeAnne = await AnneeScolaire.findOne({
                where:{
                  active:true
                }
               })
               if(activeAnne){
                throw new ValidationError('يسمح فقط بسنة دراسية واحدة صالحة')
               }
               
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