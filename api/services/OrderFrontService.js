const { Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const { tryCouponSchema } = require("../../utils/validations/OrderSchema")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")
const schemaValidation = require("../../utils/validations")
const { default: axios } = require("axios")

module.exports={
    addOrder:(req)=>{
        let ordered
        let cd
        let createdOrder
     
        return CartDetail.findAll({
            where:{
                addedBy:req.user.id
            },
            
            include:[{
                model:AnneeNiveauUser,
                foreignKey:'cart_detail_id'
            },{
                model:Pack,
                foreignKey:'pack_id'
             }]
        }).then(cartDetails=>{
            if(cartDetails.length){
                cd=cartDetails
                ordered =cartDetails.reduce((prev,curr)=>{
                  prev.ans = prev.ans.concat(curr.AnneeNiveauUsers)  
                  prev.price+=curr.price
                  prev.priceAfterReduction+=curr.priceAfterReduction
                  if(!prev.packs.map(p=>p.id).includes(curr.Pack.id)){
                    prev.packs.push(curr.Pack)
                  }
                  return prev 
                },{ans:[],price:0,priceAfterReduction:0,packs:[]}) 
                
                let today  = new Date()
                return Order.create({
                    code:today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+Math.floor(Math.random()*100),
                    price:ordered.price,
                    priceAfterReduction:ordered.priceAfterReduction,
                    addedBy:req.user.id,
                    isCombined:(cartDetails.length>1)
                })
            }
            else{
                return Promise.reject(new ValidationError({message:'عربة التسوق فارغة'}))
            }


        }).then(order=>{
            createdOrder = order 
            return Promise.all([ordered.ans.map(a=>a.update({order_id:order.id})),CartDetail.destroy({where:{
                id:{
                    [Op.in]:cd.map(c=>c.id)
                }
            }})])
        }).then(sd=>{
           return createdOrder.addPacks(ordered.packs)
        }).then(sd=>{
           return  createdOrder
        })
    },
    applicateCoupon:(req)=>{
        //   let orgPrice
        let order
           
           return new Promise((resolve,reject)=>{
               const bodyValidation = schemaValidation(tryCouponSchema)(req.body)
               if(bodyValidation.isValid){
                   return resolve()
               }
               else{
                   return reject(new ValidationError({message:bodyValidation.message}))
               }
           }).then(()=>{
               return Order.findOne({where:{
                   code:req.params.id,
                   addedBy:req.user.id,
                   status:'onhold'
               }})
            }).then((c)=>{
               if(!c){
                   return Promise.reject(new RecordNotFoundErr())
               }
               order = c
               return Coupon.findOne({where:{
                code:req.body.code,
                used:{
                   [Op.lt]:Sequelize.col("limit")
                }  
               },
               
               include:{
                   model:Order,
                   foreignKey:'coupon_id',
                  
                   
               },
              
               })
   
           }).then(c=>{
                
               if(c){
                 //  console.log(c.Orders.some(o=>o.addedBy===req.user.id))
                
                if(c.expiredDate && new Date(c.expiredDate)<new Date()){
                    return Promise.reject(new ValidationError({message:'لقد انتهت صلاحية رمز الخصم'}))  
                } 
                 if(c.Orders.length&&c.Orders.some(o=>o.type!=='expired'&&o.addedBy===req.user.id)){
                       return Promise.reject(new ValidationError({message:'لقد استخدمت هذه القسيمة من قبل'}))
                   }
                   else{
                       return c
                   }
                  
               }
               else{
                   return Promise.reject(new ValidationError({message:'قسيمة غير صالحة'}))
               }
           }).then(c=>{
              // console.log(coqupon)

                return Promise.all([order.update({priceAfterReduction:(c.type==='percentage')?order.priceAfterReduction-((order.priceAfterReduction*c.reduction)/100):order.priceAfterReduction-c.reduction,coupon_id:c.id})
                ,c.update({used:c.used+1})   
               ])
             }).then(c=>{
   
                   return {message:'تم تطبيق الخصم بنجاح'}
   
             })
     
   
   
       },
       payUsingCart:async (req)=>{
            return Order.findOne({where:{
                code:req.params.id,
                status:'onhold',
                addedBy:req.user.id
           
            }}).then(o=>{
                    if(!o){
                        return Promise.reject(new RecordNotFoundErr())
                    }
                    else{
                         const payment_conf = sails.config.custom.payment
                        return axios.post('https://ipay.clictopay.com/payment/rest/register.do',{
                            'userName' : payment_conf.username,
                            'password' : payment_conf.username,
                            'orderNumber' : o.code,
                            'amount' : o.priceAfterReduction,
                            'language' : "fr",
                            'currency' :"788",
                            'pageView' :'DESKTOP',
                            'returnUrl': payment_conf.successUrl,
                            'failUrl' :payment_conf.failUrl,
                            'clientId': req.user.id,
                        })
                    }
             }).then(c=>{
                
                
            })
       }
       
       
   




}