const dayjs = require('dayjs');
const {
    DataTypes 
  } = require('sequelize'); 
  
 
  
  module.exports = {
    options: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      scopes: {},

      tableName: 'orders',

      indexes:[/*{
        unique:true,
        fields:['orderId']
      }*/,{
        unique:true,
        fields:['code']
      }],
      hooks:{
        beforeSave:async (order,options)=>{
          if(order.isNewRecord){
            order.expiredDate = sails.config.custom.payment.expiredDate?dayjs().add(sails.config.custom.payment.expiredDate,'minute').toISOString():dayjs().add(20,'minute').toISOString()
         }  
          if(!order.isNewRecord&&order.changed('secretCode')){
               order.expiredDate = sails.config.custom.payment.expiredDate?dayjs().add(sails.config.custom.payment.expiredDate,'minute').toISOString():dayjs().add(20,'minute').toISOString()
          }
          if(order.changed('status') && order.status==='active'){
           await AnneeNiveauUser.findAll({where:{order_id:order.id}}).then(ans=>{
                  return Promise.all(ans.map(a=>a.update({type:'paid'})))
                })
          }
          

        },
        beforeUpdate:async (order,options)=>{
          if(order.isNewRecord){
            order.expiredDate = sails.config.custom.payment.expiredDate?dayjs().add(sails.config.custom.payment.expiredDate,'minute').toISOString():dayjs().add(20,'minute').toISOString()
         }  
          if(!order.isNewRecord&&order.changed('secretCode')){
               order.expiredDate = sails.config.custom.payment.expiredDate?dayjs().add(sails.config.custom.payment.expiredDate,'minute').toISOString():dayjs().add(20,'minute').toISOString()
          }
          if(order.changed('status') && order.status==='active'){
            let user = await User.findByPk(order.addedBy,{attributes:['role_id'],include:{
              model:Role,
              attributes:['name']
            }})
            if(user.Role.name = sails.config.custom.roles.parent.name){
              await AnneeNiveauUser.findAll({where:{order_id:order.id}}).then(ans=>{
                return Promise.all(ans.map(a=>a.update({type:'paid'})))
              })
            }
            if(user.Role.name = sails.config.custom.roles.teacher.name){
              await TeacherPurchase.findAll({where:{order_id:order.id}}).then(ans=>{
                return Promise.all(ans.map(a=>a.update({type:'paid'})))
              })
            }

           }
          

        }
      }
      
      
    },
    datastore: 'default',
    tableName: 'orders',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        code: {
            type: DataTypes.STRING,
            allowNull:false
        },
        orderId:{
            type: DataTypes.STRING,
          //  allowNull:false
        },
        price:{
            type:DataTypes.FLOAT,
            allowNull:false

        },
        isCombined:{
          type:DataTypes.BOOLEAN,
          defaultValue:false
        },
        priceAfterReduction:{
          type:DataTypes.FLOAT,
          allowNull:false
        },
        secretCode:{
          type:DataTypes.STRING,
          allowNull:false
        },
        expiredDate:{
          type:DataTypes.DATE,
          allowNull:true
        },
        status:{
            type:DataTypes.ENUM('active','onhold','expired','shipping'),
            defaultValue:'onhold'
        },



        
    },
    associations : function(){
      Order.belongsToMany(Pack,{
        through:'orders_packs'
       })
      
      
       Order.belongsTo(PayConfig,{
        foreignKey:'payment_type_id'
       })
       Order.belongsTo(User,{
        foreignKey:'addedBy'
       })
       Order.belongsTo(Coupon,{
        foreignKey:'coupon_id'
       })
       Order.hasMany(AnneeNiveauUser,{
        foreignKey:'order_id'
       })
       Order.hasMany(TeacherPurchase,{
        foreignKey:'order_id'
       })
       
       
       
    }
  };
  