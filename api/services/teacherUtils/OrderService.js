const ValidationError = require("../../../utils/errors/validationErrors")
const sequelize = require('sequelize')
const { DataHandlor } = require("../../../utils/translateResponseMessage")
const RecordNotFoundErr = require("../../../utils/errors/recordNotFound")
const schemaValidation = require("../../../utils/validations")
const { prepaidCartPayment } = require("../../../utils/validations/OrderSchema")
module.exports={
    createOrder:(req)=>{
        let ordered
        let cd
        let createdOrder
        return CartDetail.findAll({
            where:{
                addedBy:req.user.id
            },
            
            include:[{
                model:TeacherPurchase,
                foreignKey:'cart_detail_id'
            },{
                model:Pack,
                foreignKey:'pack_id'
             }]
        }).then(cartDetails=>{
            if(cartDetails.length){
                cd=cartDetails
                ordered =cartDetails.reduce((prev,curr)=>{
                  prev.ans = prev.ans.concat(curr.TeacherPurchases)  
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


        }).then(o=>{
            createdOrder = o
            let promises =  ordered.ans.map(a=>a.update({order_id:o.id}))
            promises.push(CartDetail.destroy({where:{
                addedBy:req.user.id
            }}))
            return Promise.all(promises)
         }).then(result=>{
            return createdOrder.addPacks(ordered.packs)
        }).then(sd=>{
            return createdOrder
        })


    },
    getOrder:async (req)=>{
       
            return  Order.findOne({
                where:{
                    code:req.params.id,
                    addedBy:req.user.id,
                    status:{
                        [sequelize.Op.notIn]:['expired']
                    },
                },include:[{
                    
                    model:TeacherPurchase,
                    foreignKey:'order_id',
                    attributes:['type'],
                    include:[{
                        model:Trimestre,
                        foreignKey:'trimestre_id',
                        attributes:['name_ar','id']
                     },{
                        model:AnneeScolaire,
                        foreignKey:'annee_scolaire_id',
                        attributes:['startingYear','endingYear']
                     },{
                        model:NiveauScolaire,
                        foreignKey:'niveau_scolaire_id',
                        attributes:['name_ar']
                     }],
                    
                },{
                    model:Pack,
                    foreignKey:'pack_id',
                    attributes:['name','nbTrimestres','price'],
                    include:{
                        model:Upload,
                        foreignKey:'photo',
                        attributes:['link']
                    }
                } ,{
                    model:User,
                    foreignKey:'addedBy',
                    attributes:['firstName','lastName','phonenumber'],
                    include:[{
                        model:Country,
                        foreignKey:'country_id',
                        attributes:['name']
                    },{
                        model:State,
                        foreignKey:'state_id',
                        attributes:['name']
                    }]
                 }]
                
            })
           
      },

    findAllOrders: (req)=>{
        let allowedTypes=['onhold','paid','shipping']
        
        const {type} = req.params 
        if(!allowedTypes.includes(type) && type!='all'){
            return Promise.reject(new ValidationError())
        }
        else{
           return  Order.findAll({where:{
                addedBy:req.user.id,
                status:(type==='all')?{[sequelize.Op.in]:allowedTypes}:type    
            },include:{
                model:Pack,
                through:'orders_packs',
                attributes:['id','name'],
                include:{
                    model:Upload,
                    foreignKey:'photo',
                    attributes:['link']
                }
            }})
            
        }
           


    },
    applicateCoupon:(req)=>{
        return sails.services.orderfrontservice.applicateCoupon(req)
    },
   
    createAdresse:(req)=>{
        return sails.services.orderfrontservice.createAdresse(req)
    },
    
    deleteAdresse:(req)=>{
        return sails.services.orderfrontservice.deleteAdresse(req)

    },
    createLivraison:(req)=>{
        return sails.services.orderfrontservice.createLivraision(req)
    },
    payUsingVirement:(req)=>{
        return sails.services.orderfrontservice.payUsingVirement(req)
    },
    payLivraison:(req)=>{
        return sails.services.orderfrontservice.payLivraison(req)

    },
    payUsingPrepaidCart:(req)=>{
        return sails.services.orderfrontservice.payUsingPrepaidCart(req)

    }


    


}
    




