const { Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OrderShema } = require("../../utils/validations/OrderSchema")
const resolveError = require("../../utils/errors/resolveError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")

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
    


}