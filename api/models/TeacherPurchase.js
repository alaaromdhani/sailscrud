const { DataTypes, Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")

module.exports = {
    options: {
        tableName: 'teacher_perchases',
        datastore: 'default',
        hooks:{
            


        }
      },
      tableName: 'teacher_perchases',
      attributes: {
          id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
          },
          type:{
            type: DataTypes.ENUM('trial','paid'),
            required: true,
          }
          
      },
      associations : function(){
         TeacherPurchase.belongsTo(NiveauScolaire,{
            foreignKey:'niveau_scolaire_id'
         })
         TeacherPurchase.belongsTo(AnneeScolaire,{
            foreignKey:'annee_scolaire_id'
         })
         TeacherPurchase.belongsTo(Trimestre,{
            foreignKey:'trimestre_id'
         })
         TeacherPurchase.belongsTo(Classroom,{
            foreignKey:'classroom_id'
         })
         TeacherPurchase.belongsTo(Order,{
            foreignKey:'order_id'
         })
         TeacherPurchase.belongsTo(CartDetail,{
            foreignKey:'cart_detail_id'
         })
         
         TeacherPurchase.belongsTo(User,{
            foreignKey:'addedBy'
         })
         
        
  
          
       
  
    
      }



}