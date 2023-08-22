const { DataTypes, Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")

module.exports = {
    options: {
        tableName: 'annee_niveaux_users',
        datastore: 'default',
        hooks:{
            beforeSave: async (ann_niveau_user,options)=>{
               let existing = await AnneeNiveauUser.findOne({where:{
                  
                     annee_scolaire_id:ann_niveau_user.annee_scolaire_id,
                     user_id:ann_niveau_user.user_id,
                     trimestre_id:ann_niveau_user.trimestre_id
                  

               }}) 
               if(existing){
                  throw new ValidationError({message:'خطئ في التحقق'})
               }
            }

        }
      },
      tableName: 'annee_niveaux_users',
      attributes: {
          id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
          },
          type:{
            type: DataTypes.ENUM('trial','archive','halfpaid','paid'),
            required: true,
          }
          
      },
      associations : function(){
         AnneeNiveauUser.belongsTo(NiveauScolaire,{
            foreignKey:'niveau_scolaire_id'
         })
        AnneeNiveauUser.belongsTo(AnneeScolaire,{
            foreignKey:'annee_scolaire_id'
         })
         AnneeNiveauUser.belongsTo(Trimestre,{
            foreignKey:'trimestre_id'
         })
         AnneeNiveauUser.belongsTo(User,{
            foreignKey:'user_id'
         })
         AnneeNiveauUser.belongsTo(Order,{
            foreignKey:'order_id'
         })
        
  
          
       
  
    
      }



}