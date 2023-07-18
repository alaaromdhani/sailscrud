const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { UpdatePackShema } = require("../../utils/validations/PackSchema")
const { UpdatePrepaidcardShema } = require("../../utils/validations/PrepaidcardSchema")
const { UpdateSellerShema } = require("../../utils/validations/SellerSchema")
const converter= {
    pack:{validation:UpdatePackShema},
    prepaidcard:{validation:UpdatePrepaidcardShema},
    seller:{validation:UpdateSellerShema}

}
module.exports = {
    updatemodel:(req,callback)=>{
            const {validation} = converter[req.options.model]
            const ModelReference = sails.models[req.options.model]
            new Promise((resolve,reject)=>{
                const modelValidation  = schemaValidation(validation)(req.body)
                if(modelValidation.isValid){
                    resolve()
                }
                else{
                    reject(new ValidationError({message:modelValidation.message}))
                }
            }).then(()=>{
                return ModelReference.findByPk(req.params.id,{
                    include:{
                            model:User,
                            foreignKey:'addedBy',
                            include:{
                                model:Role,
                                foreignKey:'role_id'
                            }
                    }
                })
            }).then(m=>{
                return new Promise((resolve,reject)=>{
                    if(m){
                       if(m.User && m.User.Role.weight<=req.role.weight && m.User.id!=req.user.id){
                        return reject(new UnauthorizedError({message:'uou cannot modify this record'}))
                       }
                       return resolve(m)
                    }
                    else{
                        return reject(new RecordNotFoundErr())
                    }
                })



            }).then(m=>{
                Object.keys(req.body).forEach(k=>{
                    m[k]=req.body[k]
                })
                return m.save()

            }).then(m=>{
                callback(null,m)

            }).catch(e=>{
                if(e instanceof RecordNotFoundErr || e instanceof ValidationError|| e instanceof UnauthorizedError){
                    callback(e,null)
                }
                else{
                    callback(new SqlError(e),null)
                }
            }) 

    },
    deleteModel:(req,callback)=>{
        const ModelReference = sails.models[req.options.model]
        return ModelReference.findByPk(req.params.id,{ 
            include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }
            }
        }).then(m=>{
            return new Promise((resolve,reject)=>{
                if(m){
                   if(m.User && m.User.Role.weight<=req.role.weight && m.User.id!=req.user.id){
                    return reject(new UnauthorizedError({message:'uou cannot delete this record'}))
                   }
                   return resolve(m)
                }
                else{
                    return reject(new RecordNotFoundErr())
                }
            })


        }).then(m=>{
            return m.destroy()
        }).then(s=>{
            callback(null,{})

        }).catch(e=>{
            console.log(e)
            if(e instanceof RecordNotFoundErr || e instanceof ValidationError|| e instanceof UnauthorizedError){
                callback(e,null)
            }
            else{
                callback(new SqlError(e),null)
            }
        })

    }
    




}