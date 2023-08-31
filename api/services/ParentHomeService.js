const { Op, Sequelize } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OrderShema, calculatePriceSchema, tryCouponSchema } = require("../../utils/validations/OrderSchema")
const resolveError = require("../../utils/errors/resolveError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { array } = require("joi")
const { every } = require("lodash")
const SqlError = require("../../utils/errors/sqlErrors")

module.exports = {
    getOrderByStudent:(student_id,annee_scolaire_id)=>{
        return Order.findAll({include:{model:AnneeNiveauUser,foreignKey:'order_id',
        where:{
            user_id:student_id,
            annee_scolaire_id,
            type:'trial'
        }}})
    },
    addOrder:(req,callback)=>{
        let order
        let ordred
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(OrderShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidation.message}))
            }
        }).then(()=>{
            return AnneeNiveauUser.findAll({
                where:{id:{
                    [Op.in]:req.body.annee_niveau_users
                },
                    type:'trial'
                },

                include:[{
                    model:User,
                    foreignKey:'user_id',
                    attributes:['addedBy']
                }],
                raw:true,
                nest:true

            },)

        }).then(annee_niveau_users=>{
             
            if(!annee_niveau_users.length){
                return Promise.reject(new ValidationError())
            }
            let annee_scolaire_id =annee_niveau_users[0].annee_scolaire_id
            let user_id =annee_niveau_users[0].user_id
            if(!annee_niveau_users.every(a=>!a.order_id && a.User.addedBy==req.user.id&&a.annee_scolaire_id===annee_scolaire_id)){
                return Promise.reject(new UnauthorizedError())
            }
            ordred = annee_niveau_users
            return sails.services.parenthomeservice.getOrderByStudent(user_id,annee_scolaire_id) 
        }).then(o=>{
            if(o.length){
                return Promise.reject(new ValidationError({message:'يجب عليك دفع جميع الطلبات المعلقة لهذا الطالب'}))
            }
            else{
                return sails.services.parenthomeservice.calculatePriceByNbTrimestres(req,ordred.length)
            }

        }).then(c=>{
            let today  = new Date()
          
            return Order.create({
                code:today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+Math.floor(Math.random()*100),
                price:c.orgPrice,
                priceAfterReduction:c.priceAfterDiscount,
                pack_id:c.pack.id,
                addedBy:req.user.id
            }) 

        }).then(o=>{
            order = o
            return Promise.all(ordred.map(ans=>AnneeNiveauUser.update({order_id:o.id},{where:{id:ans.id}})))
        }).then(sd=>{
            
            callback(null,order)
        }).catch(e=>{
            console.log(e)
            callback(resolveError(e))
        }) 
    },
    deleteOrder:(req,callback)=>{
        let order
        Order.findOne({where:{
            code:req.params.id,
            addedBy:req.user.id,
            status:'onhold'
        }}).then(o=>{
           if(o){
            order =o
            if(o.coupon_id){return Coupon.findByPk(o.coupon_id)}
            else{return}
           }
           else{
            return Promise.reject(new RecordNotFoundErr()) 
           }
         }).then(o=>{
            if(o){
                return o.update({used:o.used-1})
            }
            else{
                return 
            }
        }).then(o=>{
            return AnneeNiveauUser.findAll({where:{order_id:order.id}})
        }).then(ans=>{
            return Promise.all(ans.map(a=>a.update({order_id:null})))
        }).then((ans)=>{
            return order.update({status:'expired'})
        
        }).then(a=>{
          callback(null,{})  
         }).catch(e=>{
            callback(new SqlError(e))
        })



    },
    calculatePriceByNbTrimestres:(req,nbTrimestres)=>{
        let pack
        let orgPrice
        return Pack.findOne({where:{
            nbTrimestres:(nbTrimestres>=3)?3:nbTrimestres
        }})
        .then(p=>{
      if(p){
        orgPrice = p.price
            pack = p
        return 
        } 
      else{
        return Promise.reject(new ValidationError())
      } 
    }).then(()=>{
      return AnneeNiveauUser.findAll({
        where:{
            order_id:{
                [Op.ne]:null
            }
        },
        include:{
            model:User,
            foreignKey:'user_id',
            where:{
                addedBy:req.user.id
            },
            required:true
        }
      })     
    }).then(annee_niveau_users=>{
        const nb=annee_niveau_users.length+nbTrimestres
        const {remises} =sails.config.custom     
        if(!remises){
            return Promise.reject(new ValidationError({message:'no remises found'}))
        }
        else{
           return Object.keys(remises).map(r=>parseInt(r)).filter(r=>r<=nb).sort((a,b)=>b-a).map(r=>remises[r]).at(0)
        }    
    }).then(r=>{
        if(r){
           return {orgPrice,priceAfterDiscount:(orgPrice-((orgPrice*r)/100)),pack}
        }
        else{
            return {orgPrice,priceAfterDiscount:orgPrice,pack}
        }
    })
    },
    getPaybleTrimestres:(req,callback)=>{
        const {student_id,annee_scolaire_id} = req.params
        User.findOne({where:{
            id:student_id,
            addedBy:req.user.id
        }}).then(u=>{
            console.log(u)
            if(u){
                return u
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        }).then(u=>{
            return AnneeNiveauUser.findAll({where:{
                user_id:u.id,
                annee_scolaire_id,
                order_id:null,
                type:{
                    [Op.ne]:'archive'
                }
            },include:{
                model:Trimestre,
                foreignKey:'trimestre_id',
                attributes:['id','name_ar']
            }})


        }).then(annee_niveau_users=>{
            if(annee_niveau_users.length){
                callback(null,annee_niveau_users)
            }
            else{
                callback(null,[])
            }
            //  
        }).catch(e=>{
            //console.log(e)
            callback(resolveError(e))
         })

    },
    calculatePrice:(req,callback)=>{
         let orgPrice
         let bodyData = {nbTrimestres:parseInt(req.query.nbTrimestres)}
            return new Promise((resolve,reject)=>{
                const bodyValidation = schemaValidation(calculatePriceSchema)(bodyData)
                if(bodyValidation.isValid){
                    return resolve()
                }
                else{
                    return reject(new ValidationError())
                }
            }).then(()=>{
               return sails.services.parenthomeservice.calculatePriceByNbTrimestres(req,bodyData.nbTrimestres)
            }).then(c=>{
                callback(null,c)
            }).catch(e=>{
                callback(resolveError(e))
            })

    },
    calculatePriceAfterCoupon:(req,callback)=>{
     //   let orgPrice
     let coupon
     let orgPrice
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(tryCouponSchema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidation.message}))
            }
        }).then(()=>{
            
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
            raw: true,
            nest: true,
            })

        }).then(c=>{

            if(c){
                if(c.Orders.length&&c.Orders.some(o=>o.addedBy===req.user.id)){
                    return Promise.reject(new ValidationError({message:'لقد استخدمت هذه القسيمة من قبل'}))
                }
                else{
                    coupon = c
                    return 
                }
               
            }
            else{
                return Promise.reject(new ValidationError({message:'قسيمة غير صالحة'}))
            }
        }).then(()=>{
            return Pack.findOne({where:{
                nbTrimestres:(req.body.nbTrimestres>=3)?3:req.body.nbTrimestres
            }})
        }) .then(p=>{
                if(p){
                  orgPrice = p.price
                  return 
                  } 
                else{
                  return Promise.reject(new ValidationError())
                } 
              }).then(()=>{
            return AnneeNiveauUser.findAll({
              where:{
                  type:'paid'
              },
              include:{
                  model:User,
                  foreignKey:'user_id',
                  where:{
                      addedBy:req.user.id
                  },
                  required:true
              }
            })     
          }).then(annee_niveau_users=>{

              const nbTrimestres=annee_niveau_users.length+req.body.nbTrimestres
              const {remises} =sails.config.custom     
              if(!remises){
                  return Promise.reject(new ValidationError({message:'no remises found'}))
              }
              else{
                 return Object.keys(remises).map(r=>parseInt(r)).filter(r=>r<=nbTrimestres).sort((a,b)=>b-a).map(r=>remises[r]).at(0)
              }    
          }).then(r=>{
            console.log(coupon)
              if(!r){
                r=0
              }
              let priceAfterDiscount=(orgPrice-((orgPrice*r)/100))
              let priceAfterCoupon =priceAfterDiscount-((priceAfterDiscount*coupon.reduction)/100) 
              req.session.coupon_id = coupon.id
              callback(null,{orgPrice,priceAfterDiscount:priceAfterCoupon})
        
          }).catch(e=>{
                console.log(e)
              callback(resolveError(e))
          })
  


    },
    




    


}