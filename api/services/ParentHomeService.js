const { Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OrderShema, calculatePriceSchema } = require("../../utils/validations/OrderSchema")
const resolveError = require("../../utils/errors/resolveError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { array } = require("joi")

module.exports = {
    addOrder:(req,callback)=>{
        let order
        let records
        return new Promise((resolve,reject)=>{
            const addOrderSchema = schemaValidation(OrderShema)(req.body)
            if(addOrderSchema.isValid){
                    req.body.trimestres = Array.from(new Set(req.body.trimestres))
                    if(req.body.trimestres.length===3){
                        req.body.trimestres=[1,2,3,4]
                    }
                    return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
            //see if there is already an onhold order
            return Order.findOne({where:{
                addedBy:req.user.id,
                status:'onhold'
            }})
        }).then(o=>{
            if(o){
                return Promise.reject(new ValidationError({message:'عليك أن تدفع الطلبات المعلقة'}))    
            }
            else{
                return User.findOne({where:{id:req.body.studentId,addedBy:req.user.id}})
            }
        }).then(u=>{
            if(!u){
                return Promise.reject(new ValidationError({message:'طالب غير صالح'}))
            }
            else{
                return AnneeNiveauUser.findAll({where:{
                    user_id:req.body.studentId,
                    trimestre_id:{
                        [Op.in]:req.body.trimestres
                    },
                    niveau_scolaire_id:req.body.niveau_scolaire_id,
                    type:'trial'
                }})
            }
        }).then(data=>{
              if(data && data.length===req.body.trimestres.length){
                records = data
                return Pack.findOne({
                    where:{
                        nbTrimestres:req.body.trimestres.length===4?3:req.body.trimestres.length
                    }
                }) 
                }
               else{
                return Promise.reject(new ValidationError())
               } 
        }).then(p=>{
            if(p){
                let today  = new Date()
                return Order.create({
                    code:today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+Math.floor(Math.random()*100),
                    price:p.price,
                    pack_id:p.id,
                    addedBy:req.user.id
                }) 
            }
            else{
                return Promise.reject(new ValidationError({message:'خطة تسعير غير صالحة'}))
            }
        }).then(o=>{
            order = o
            return Promise.all(records.map(r=>{
                r.order_id = o.id
                return r.save()
            }))
        }).then(sd=>{

            callback(null,{message:'تم تمرير الطلب بنجاح',order})

        }).catch(e=>{
            console.log(e)
            callback(resolveError(e))

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
                callback(null,annee_niveau_users.map(a=>a.Trimestre.id))
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
                return Pack.findOne({where:{
                    nbTrimestres:(bodyData.nbTrimestres.length>=3)?3:bodyData.nbTrimestres
                }})
            }).then(p=>{
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
                const nbTrimestres=annee_niveau_users.length+bodyData.nbTrimestres
                const {remises} =sails.config.custom     
                if(!remises){
                    return Promise.reject(new ValidationError({message:'no remises found'}))
                }
                else{
                   return Object.keys(remises).map(r=>parseInt(r)).filter(r=>r<=nbTrimestres).sort((a,b)=>b-a).map(r=>remises[r]).at(0)
                }    
            }).then(r=>{
                if(r){
                    callback(null,{orgPrice,priceAfterDiscount:(orgPrice-((orgPrice*r)/100))})
                }
                else{
                    callback(null,{orgPrice,priceAfterDiscount:orgPrice})
                }
            }).catch(e=>{
                console.log(e)
                callback(resolveError(e))
            })

    },



    


}