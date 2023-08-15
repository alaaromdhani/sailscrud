const { DataTypes } = require("sequelize")

module.exports = {
    options: {
        tableName: 'annee_niveaux_users',
        datastore: 'default',
      },
      tableName: 'annee_niveaux_users',
      attributes: {
          id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
          },
          
      },
      associations : function(){
         AnneeNiveauUser.belongsTo(NiveauScolaire,{
            foreignKey:'niveau_scolaire_id'
         })
         AnneeNiveauUser.belongsTo(AnneeScolaire,{
            foreignKey:'annee_scolaire_id'
         })
         AnneeNiveauUser.belongsTo(User,{
            foreignKey:'user_id'
         })
        
  
          
       
  
    
      }



}