const { Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const { tryCouponSchema, prepaidCartPayment } = require("../../utils/validations/OrderSchema")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")
const schemaValidation = require("../../utils/validations")
const { default: axios } = require("axios")
const UnkownError = require("../../utils/errors/UnknownError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")


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
                let code = today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+today.getMilliseconds()+Math.floor(Math.random()*100)
     
                return Order.create({
                   code,
                   price:ordered.price,
                    priceAfterReduction:ordered.priceAfterReduction,
                    addedBy:req.user.id,
                    secretCode:code,
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
                    if(o.orderId ){
                        let today = new Date()
                        if(today<new Date(o.expiredDate)){
                            return o
                        }
                        else{
                            const payment_conf = sails.config.custom.payment
                             let code = today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+today.getMilliseconds()+Math.floor(Math.random()*100)
                            
                             return o.update({secretCode:code}).then(o=>{
                                return axios.get('https://ipay.clictopay.com/payment/rest/register.do?userName='+payment_conf.username+'&password='+payment_conf.password+'&orderNumber='+o.secretCode+'&pageView=DESKTOP&amount='+o.priceAfterReduction+'&currency=788&returnUrl='+payment_conf.returnUrl+'&failUrl='+payment_conf.returnUrl)})
                                .then(res=>{
                                            if(res.data){
                                    if(typeof(res.data)==='object'){
                                        let d = res.data
                                        return o.update({orderId:d.orderId})
                                    }
                                    else if(typeof (res.data)==='string'){
                                        let d = JSON.parse(res.data)
                                        return o.update({orderId:d.orderId})
                                    }
                                    else{
                                        return Promise.reject(new UnkownError())
                                    }
                                }
                            }).then(order=>{
                                return {orderId:order.orderId,url:'https://ipay.clictopay.com:443/epg/merchants/CLICTOPAY/payment.html?mdOrder='+order.orderId+'&language=fr'}
                      
                            })
                        }
                    }
                    else{
                         const payment_conf = sails.config.custom.payment
               //          console.log(payment_conf)
                        return axios.get('https://ipay.clictopay.com/payment/rest/register.do?userName='+payment_conf.username+'&password='+payment_conf.password+'&orderNumber='+o.secretCode+'&pageView=DESKTOP&amount='+o.priceAfterReduction+'&currency=788&returnUrl='+payment_conf.returnUrl+'&failUrl='+payment_conf.returnUrl).then(res=>{
                            if(res.data){
                                if(typeof(res.data)==='object'){
                                    let d = res.data
                                    return o.update({orderId:d.orderId})
                                }
                                else if(typeof (res.data)==='string'){
                                    let d = JSON.parse(res.data)
                                    return o.update({orderId:d.orderId})
                                }
                                else{
                                    return Promise.reject(new UnkownError())
                                }
                            }
                        })
                     }
                  }).then(order=>{
                        return {orderId:order.orderId,url:'https://ipay.clictopay.com:443/epg/merchants/CLICTOPAY/payment.html?mdOrder='+order.orderId+'&language=fr'}
              
                    })
       },
       payUsingPrepaidCart:async(req)=>{
        let order 
        return new Promise((resolve,reject)=>{
            const bodyValidaion = schemaValidation(prepaidCartPayment)(req.body)
            if(bodyValidaion.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidaion.message}))
            }
        }).then(()=>{
           return  Order.findOne({where:{
                code:req.params.id,
                status:'onhold',
                coupon_id:null,
                
                addedBy:req.user.id,
                isCombined:false,
                
            },include:{
                model:Pack,
                through:'orders_packs',
                attributes:['id']
            }})
        }).then(o=>{
          if(!o || o.dataValues.Packs.length!==1){
            
            return Promise.reject(new RecordNotFoundErr())
          }
          
          else{
            console.log(o.dataValues.Packs[0].dataValues)
            order =o
            return Card.findOne({
                where:{
                    code:req.body.code,
                    used:false
                },
                include:{
                    model:PrepaidCard,
                    foreignKey:'serie_id',
                    where:{
                        pack_id:o.dataValues.Packs[0].dataValues.id
                    },
                    required:true
                }
            })
          }     
        }).then(c=>{
            if(!c){
                return Promise.reject(new ValidationError({message:'رمز البطاقة خاطئ'}))
            }
            else{
                return c.update({used:true,order_id:order.id})
            }
        }).then(c=>{
            return order.update({payment_type_id:3,status:'active'})

        })


       },
       verifyPayement:(req)=>{
             
        const {orderId,orderCode} = req.query
        if(!orderId && !orderCode){
            return Promise.reject(new ValidationError()) 
        }
        if(orderId){
            const payment_conf = sails.config.custom.payment
            return axios.get('https://ipay.clictopay.com/payment/rest/getOrderStatus.do?language=en&orderId='+orderId+'&password='+payment_conf.password+'&userName='+payment_conf.username)
            .then(a=>{
                let resData
                if(typeof(a.data)==='object'){
                    resData=a.data
                }
                else if(typeof(a.data)==='string'){
                    resData=JSON.parse(a.data)
                }
                else{
                    return Promise.reject(new UnkownError())
                }
                if(resData.OrderStatus){
                    if(resData.OrderStatus===2){
                        return Order.findOne({where:{
                            orderId:orderId,
                            priceAfterReduction:resData.Amount
                           
                        }})
                    }
                    else{
                        return Promise.resolve(new ValidationError({message:'لم يتم دفع الطلب بعد'}))
                    }
                }
             }).then(o=>{
                if(!o){
                    return Promise.reject(new RecordNotFoundErr())
                }
                else{
                    return o.update({status:'active',payment_type_id:1})
                }
            })
        }
        else{
            return Order.findOne({where:{
                code:orderCode,
                status:'paid'
            }}).then(o=>{
                if(o){
                    return Promise.reject(new RecordNotFoundErr()) 
                }
                else{
                    return o
                }    
           })
        }
       }
       
       
   




}