const sequelize = require('sequelize')
const schemaValidation = require('../../../utils/validations')
const TeacherperchaseShema = require('../../../utils/validations/TeacherperchaseSchema')
const ValidationError = require('../../../utils/errors/validationErrors')
const RecordNotFoundErr = require('../../../utils/errors/recordNotFound')
const SqlError = require('../../../utils/errors/sqlErrors')
module.exports={
    getPayableTrimestres:(req)=>{
        let {classroom_id} = req.params
        return TeacherPurchase.findAll({where:{
            addedBy:req.user.id,
            classroom_id,
            order_id:null,
            cart_detail_id:null,
            type:{
                [sequelize.Op.ne]:'paid'
            }
        },
        attributes:['id','type'],
        include:{
            model:Trimestre,
            foreignKey:'trimestre_id',
            attributes:['name_ar','id'],
            where:{
                active:true
            }
        }
        })
    },
    canAddFourthTrimestre:(req)=>{
        let allPersuses=[]
        let {annee_niveau_classrooms} = req.body
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(TeacherperchaseShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
         return TeacherPurchase.findAll({where:{
                id:{
                    [sequelize.Op.in]:annee_niveau_classrooms,
                    
                }
            }})
        }).then((purchases)=>{
            allPersuses = allPersuses.concat(purchases)
            if(purchases.length>0){
                
                return TeacherPurchase.findAll({
                    where:{
                        id:{
                            [sequelize.Op.notIn]:annee_niveau_classrooms,
                        },
                        classroom_id:purchases[0].classroom_id,
                        addedBy:req.user.id,
                        cart_detail_id:{
                            [sequelize.Op.ne]:null
                        }          
                }})
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        }).then(perchases=>{
            
            allPersuses = allPersuses.concat(perchases)
            console.log(allPersuses.length)
            if(allPersuses.length==4 || (allPersuses.length==3 && !allPersuses.map(p=>p.trimestre_id).includes(4))){
                return {canAddForthTrimestre:true} 
            }
            else{
                return {canAddForthTrimestre:false}
            }
        })
    },
    addToCart:(req)=>{
        let ordred
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(TeacherperchaseShema)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
            let {annee_niveau_classrooms} =req.body
            return TeacherPurchase.findAll({where:{
                id:{
                    [sequelize.Op.in]:annee_niveau_classrooms,
                    
                },
                addedBy:req.user.id,
                    order_id:null,
                    cart_detail_id:null,
                    type:'trial',
            }})
        }).then(purchases=>{
            //for reasons we don't any persuase to be attributed an old purchase that has an order or a cart_detail or even paid
            if(purchases.length){
                ordred = purchases
                let classroom_id = purchases[0].classroom_id
                //we need every cart detail to be about one classroom
                if(purchases.every(p=>p.classroom_id==classroom_id)){
                    return CartDetail.findOne({where:{
                        addedBy:req.user.id
                   },include:{
                        model:TeacherPurchase,
                        foreignKey:'cart_detail_id',
                        where:{
                            classroom_id
                        }
                   }}) 
               }
                else{
                    return Promise.reject(new ValidationError())
                }
            }
            else{
                return Promise.reject(new ValidationError())
            }
        }).then(c=>{
            if(!c){
                return Pack.findOne({where:{
                    nbTrimestres:ordred.length
                }}).then(p=>{
                    if(!p){
                        return Promise.reject(new SqlError({message:'no pack is valid with this plan'}))
                    }
                    
                    if(p.dataValues.nbTrimestres===3){
                        return CartDetail.findOne({where:{
                            addedBy:req.user.id,
                            
                            pack_id:p.dataValues.id
                        }}).then(c=>{
                            if(c){
                                return CartDetail.create({
                                    price:p.dataValues.price,
                                    addedBy:req.user.id,
                                    pack_id:p.dataValues.id,
                                    priceAfterReduction:p.dataValues.price/2,
                                    isReducted:true
                                }).then(cd=>{
                                     return    cd.addTeacherPurchases(ordred)
                                })
                            }
                            else{
                                return CartDetail.create({
                                    price:p.dataValues.price,
                                    addedBy:req.user.id,
                                    pack_id:p.dataValues.id,
                                    priceAfterReduction:p.dataValues.price,
                                }).then(cd=>{
                                   return  cd.addTeacherPurchases(ordred)
                                })
                            }
                        })
                    }
                    else{
                        return CartDetail.create({
                            price:p.dataValues.price,
                            addedBy:req.user.id,
                            pack_id:p.dataValues.id,
                            priceAfterReduction:p.dataValues.price,
                        }).then(cd=>{
                         return    cd.addTeacherPurchases(ordred)
                        })
                    }

                })                

            }
            else{
               if((c.dataValues.TeacherPurchases.length+ordred.length)>=3){
                return CartDetail.findOne({where:{
                    addedBy:req.user.id,
                    
                },include:[{
                    model:TeacherPurchase,
                    foreignKey:'cart_detail_id',
                    where:{
                        classroom_id:{
                            [sequelize.Op.ne]:ordred[0].classroom_id
                        },
                    },
                    required:true
                
                    },
                    {
                        model:Pack,
                        foreignKey:'pack_id',
                        where:{nbTrimestres:3},
                        required:true
                    }
                     ]}).then(cartDetailPack3=>{
                    if(cartDetailPack3){
                      return c.addTeacherPurchases(ordred).then(sd=>{
                       return c.update({price:cartDetailPack3.dataValues.Pack.dataValues.price,priceAfterReduction:cartDetailPack3.dataValues.Pack.dataValues.price/2,pack_id:cartDetailPack3.dataValues.Pack.dataValues.id})
                      })  
                    }  
                    else{
                        return Pack.findOne({where:{
                            nbTrimestres:3
                        }}).then(p=>{
                            return c.addTeacherPurchases(ordred).then(sd=>{
                                return c.update({price:p.dataValues.price,priceAfterReduction:p.dataValues.price,pack_id:p.dataValues.price})
                            })  
                        })
                    }                  
                })
               }
               else{
                    return Pack.findOne({where:{
                        nbTrimestres:(c.dataValues.TeacherPurchases.length+ordred.length)
                    }}).then(p=>{
                         return c.addTeacherPurchases(ordred).then(sd=>{
                           return  c.update({price:p.dataValues.price,priceAfterReduction:p.dataValues.price,pack_id:p.dataValues.id})
                        })   
                    })
               }
            }



        })

    },
    readCart:(req)=>{
        return CartDetail.findAll({where:{
            addedBy:req.user.id   
       },
       attributes:['id','price','priceAfterReduction']
       ,include:[{
           model:TeacherPurchase,
           foreignKey:'cart_detail_id',
           attributes:['trimestre_id'],
           include:[
            {model:Trimestre,foreignKey:'trimestre_id',attributes:['name_ar']},
            {model:AnneeScolaire,foreignKey:'annee_scolaire_id',
            attributes:['startingYear','endingYear']},
            {model:NiveauScolaire,foreignKey:'niveau_scolaire_id',attributes:['name_ar']}]
       },{
           model:Pack,
           foreignKey:'pack_id',
           attributes:['name','price'],
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
    removeFromCart:(req)=>{
        return CartDetail.findOne({where:{
            id:req.params.id,
            addedBy:req.user.id
        },include:{
            model:Pack,
            foreignKey:'pack_id',
            attributes:['price','nbTrimestres','id']
        }}).then(c=>{
           if(!c){
            return Promise.reject(new RecordNotFoundErr())
           }
           else{
            if((c.dataValues.priceAfterReduction==c.dataValues.price) && (c.dataValues.Pack.nbTrimestres===3)){
                return CartDetail.findOne({where:{
                    addedBy:req.user.id,
                   pack_id:c.dataValues.Pack.dataValues.id, 
                    id:{
                        [sequelize.Op.ne]:c.dataValues.id
                    }
                }}).then(found=>{
                    if(found){
                        return found.update({priceAfterReduction:found.dataValues.price}).then(updated=>{
                            return c.destroy()
                        })
                    }
                    else{
                        return 
                    }
                    
                })

            }
            else{
                return c.destroy()
            }

           }

        })
    }
}