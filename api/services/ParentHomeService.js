const { Op, Sequelize } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OrderShema, tryCouponSchema, trimestreVerifier } = require("../../utils/validations/OrderSchema")
const resolveError = require("../../utils/errors/resolveError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { array } = require("joi")
const { every } = require("lodash")
const SqlError = require("../../utils/errors/sqlErrors")

module.exports = {
    
    getPaybleTrimestres:(req,callback)=>{
        const {student_id,annee_scolaire_id} = req.params
        User.findOne({where:{
            id:student_id,
            addedBy:req.user.id
        }}).then(u=>{
           // console.log(u)
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
                cart_detail_id:null,
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
    canAddForthTrimestre:(req)=>{
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
            return AnneeNiveauUser.findAll({where:{
                id:{
                    [Op.in]:req.body.annee_niveau_users
                }
            }})
        }).then(ans=>{
            if(ans.length){
                let annee_scolaire_id =ans[0].annee_scolaire_id
                let user_id =ans[0].user_id
                ordred = ans
                if(!ans.every(a=>!a.order_id&&!a.cart_detail_id&&a.annee_scolaire_id===annee_scolaire_id&&a.user_id==user_id)){
                    return Promise.reject(new ValidationError()) 
                } 
                
                return AnneeNiveauUser.findAll({where:{
                    user_id,
                    annee_scolaire_id,
                    cart_detail_id:{
                        [Op.ne]:null
                    }
                }})     
            }
            else{
                return Promise.reject(new ValidationError())
            } 

        }).then(ans=>{
            //console.log(ans)
            if(ans.map(a=>a.id).some(id=>req.body.annee_niveau_users.includes(id))){
                return Promise.reject(new UnauthorizedError())
            }
            ordred = ordred.concat(ans)
            if(ordred.map(a=>a.trimestre_id).includes(4) &&ordred.length==3){
                return {canAddForthTrimestre:false}
            }
            if(ans.length+req.body.annee_niveau_users.length>=3){
                return {canAddForthTrimestre:true}
            }
            else{
               return {canAddForthTrimestre:false}
            }     
            


        })
    },
    getOrderByStudent:(student_id,annee_scolaire_id)=>{
        return Order.findAll({include:{model:AnneeNiveauUser,foreignKey:'order_id',
        where:{
            user_id:student_id,
            annee_scolaire_id,
            type:'trial'
        }}})
    },
    addToCart:(req)=>{
        console.log('wow')
        let ordred
        let c
        let full 
        let p//pack
        let price
        let isReducted
        return new Promise((resolve,reject)=>{
            const  bodyValidation = schemaValidation(OrderShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
               // console.log(e)
                console.log(bodyValidation)
               return reject(new ValidationError({message:bodyValidation.message}))
            }
        }).then(()=>{
            return AnneeNiveauUser.findAll({where:{
                id:{
                    [Op.in]:req.body.annee_niveau_users
                },
             },include:{
                model:User,
                foreignKey:'addedBy',
                attributes:['addedBy']
            },
            type:'trial',})
        }).then(annee_niveau_users=>{
            if(annee_niveau_users.length){
                let annee_scolaire_id = annee_niveau_users[0].annee_scolaire_id
                let user_id =annee_niveau_users[0].user_id
                if(!annee_niveau_users.every(a=>a.User.addedBy===req.user.id&&a.user_id===user_id&&a.annee_scolaire_id===annee_scolaire_id&&!a.order_id&&!a.cart_detail_id)){
                    return Promise.reject(new UnauthorizedError()) 
                }
                ordred = annee_niveau_users     
                return AnneeNiveauUser.findAll({where:{
                    user_id,
                    annee_scolaire_id,
                    cart_detail_id:{    
                        [Op.ne]:null
                    }
                }})
            } 
            else{
                return Promise.reject(new ValidationError())
            }

        }).then(ans=>{
            if (ans.map(a=>a.id).some(a=>req.body.annee_niveau_users.includes(a.id))){
                //
                return Promise.reject(new UnauthorizedError())
            }
            else{
                full = req.body.annee_niveau_users.length+ans.length
                if(full>=3){
                    full=3
                }
                console.log(full)
                return Pack.findOne({where:{
                    nbTrimestres:full
                },raw:true})
            }
         }).then(pack=>{
            p = pack
            if(full===3){
                return CartDetail.findOne({where:{
                    pack_id:p.id,
                    addedBy:req.user.id,
                    priceAfterReduction:{
                        [Op.eq]:Sequelize.col('price')
                    }
                },include:{
                    model:AnneeNiveauUser,
                    foreignKey:'cart_detail_id',
                    where:{
                        user_id:{
                            [Op.ne]:ordred[0].user_id
                        }
                    },
                    required:true
                },raw:true,nest:true})
            }
            return 
         }).then((cd)=>{
            
            if(cd){
                price = p.price/2
                isReducted=true
            }
            else{
                price = p.price
                isReducted=false    
            }
            return 
         }).then(()=>{

            return Cart.findOrCreate({where:{addedBy:req.user.id},defaults:{addedBy:req.user.id}})

         }).then(([cart,created])=>{
            c = cart
            if(created){
                return CartDetail.create({
                    addedBy:req.user.id,
                    cart_id:cart.id,
                    pack_id:p.id,
                    price:p.price,
                    priceAfterReduction:price,
                    isReducted:(p.price!=price)
                })
            }
            else{
                //isOldAddedCart = true
                return CartDetail.findOne({where:{
                  addedBy:req.user.id ,
                },include:{
                    model:AnneeNiveauUser,
                    foreignKey:'cart_detail_id',
                    where:{
                        annee_scolaire_id:ordred[0].annee_scolaire_id,
                        user_id:ordred[0].user_id
                    },
                    required:true
                }})
            }
        }).then(cartDetail=>{
            
            if(!cartDetail){
                return CartDetail.create({
                    addedBy:req.user.id,
                    cart_id:c.id,
                    pack_id:p.id,
                    price:p.price,
                    priceAfterReduction:price,
                    isReducted:(p.price!=price)
                })
            }
            if(cartDetail && cartDetail.dataValues.AnneeNiveauUsers){
                
                return cartDetail.update({priceAfterReduction:price,price:p.price,pack_id:p.id})
            }
            return cartDetail
            
        }).then(cd=>{
            return Promise.all(ordred.map(o=>o.update({cart_id:c.id,cart_detail_id:cd.id})))              
        })

    },
    deleteFromCart:(req)=>{
        let cartDetail
        return CartDetail.findByPk(req.params.id,{
            include:{
                model:Pack,
                foreignKey:'pack_id'
            }
        }).
        then(cd=>{
            if(!cd){
                return Promise.reject(new RecordNotFoundErr())
            }
            if(cd.addedBy!=req.user.id){
                    return Promise.reject(new RecordNotFoundErr())
            }
            cartDetail = cd
            if(cartDetail.price==cartDetail.priceAfterReduction && cartDetail.Pack.nbTrimestres===3){
             return CartDetail.findAll({where:{
                id:{
                    [Op.ne]:cd.id
                },
                
             },include:{
                model:Pack,
                foreignKey:'pack_id',
                where:{
                    nbTrimestres:3
                }
            }}) 
            }
            else{
                return []
            }
        }).then(cardDetails=>{
            //console.log(cardDetails)
            if(cardDetails.length &&!cardDetails.some(c=>c.price===c.priceAfterReduction)){
                return cardDetails[0].update({priceAfterReduction:cardDetails[0].price,isReducted:false})
            }
            return 
        }).then(c=>{
            return cartDetail.destroy()
        })
    },
    readCart:(req)=>{
        return CartDetail.findAll({where:{
             addedBy:req.user.id   
        },include:[{
            model:AnneeNiveauUser,
            foreignKey:'cart_detail_id',
            attributes:['trimestre_id'],
            include:[{model:Trimestre,foreignKey:'trimestre_id',attributes:['name_ar']},{model:AnneeScolaire,foreignKey:'annee_scolaire_id',attributes:['startingYear','endingYear']},{model:NiveauScolaire,foreignKey:'niveau_scolaire_id',attributes:['name_ar']},{model:User,foreignKey:'user_id',attributes:['firstName','lastName']}]
        },{
            model:Pack,
            foreignKey:'pack_id',
            include:{
                model:Upload,
                foreignKey:'photo',
                attributes:['link']
            }
        }]}).then(cartDetails=>{
            let {price,priceAfterReduction} = cartDetails.reduce((prev,curr)=>{

                return {price:prev.price+curr.price,priceAfterReduction:prev.priceAfterReduction+curr.priceAfterReduction} 

            },{price:0,priceAfterReduction:0})
            return {cart:cartDetails,price,priceAfterReduction}
            

        })

    },
    
    
    calculateCartDetailPrice:(req,packs)=>{
        let updatedValues = {}
        let groupedPacks={}

        packs.forEach(p=>{
            groupedPacks[p.nbTrimestres]=p.price
        })
        return CartDetail.findAll({where:{
            addedBy:req.user.id
        },include:{
            model:AnneeNiveauUser,
            foreignKey:'cart_detail_id'
        }}).then(all=>{
            let grouped ={} 
            all.forEach(cd=>{
               if(grouped['cd-'+cd.id+'-a-'+cd.AnneeNiveauUser[0].user_id]){
                    grouped['cd-'+cd.id+'-a-'+cd.AnneeNiveauUser[0].user_id]++
               }
               else{
                grouped['cd-'+cd.id+'-a-'+cd.AnneeNiveauUser[0].user_id]=1  
               }
            })


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
            return order.update({status:'expired',coupon_id:null})
        
        }).then(a=>{
          callback(null,{})  
         }).catch(e=>{
            callback(new SqlError(e))
        })



    },
    /**
     * 
     * @param {AnneeNiveauUser[]} orders 
     * @param {Pack[]} packs 
     * @returns {object} {specialGrouped:Object,groupedByAnneeScolaire:Object,groupedPacks:Object} 
     */
    groupCart:(orders,packs)=>{
        let groupedById = {}
        let specialGrouped = {}
        let groupedByAnneeScolaire = {}
        let groupedPacks = {}
        packs.forEach(p=>{
            groupedPacks[p.nbTrimestres] = p
        })
        orders.forEach(element => {
            groupedById[element.id] = element
            if(!groupedByAnneeScolaire['a-'+element.annee_scolaire_id+'-s-'+element.user_id]){
                groupedByAnneeScolaire['a-'+element.annee_scolaire_id+'-s-'+element.user_id] =1
                
            }
            else{
                groupedByAnneeScolaire['a-'+element.annee_scolaire_id+'-s-'+element.user_id]++
                if(groupedByAnneeScolaire['a-'+element.annee_scolaire_id+'-s-'+element.user_id]>=3){
                    if(!Object.keys(specialGrouped).length){
                        specialGrouped[element.user_id]=true
                    }
                }
            } 
        });
        return {groupedPacks,groupedByAnneeScolaire,groupedPacks,groupedById}
        /*Object.keys(groupedByAnneeScolaire).forEach(k=>{
                let qt = groupedByAnneeScolaire[k]
                const user_id = k.split('-s-').pop()
                if(qt<3){
                    price +=groupedPacks[qt]
                }
                else{
                    if(!specialGrouped[user_id]){
                        price +=(groupedPacks[qt]/2)
                    }
                    else{
                        price +=(groupedPacks[qt])
                    }
                }
        })*/
    

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
   
    
    



    


}