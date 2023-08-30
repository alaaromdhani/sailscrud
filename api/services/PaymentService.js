const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")
const schemaValidation = require("../../utils/validations")
const UpdateCardShema = require("../../utils/validations/CardSchema")
const { UpdatePayconfigShema } = require("../../utils/validations/PayconfigSchema")

module.exports = {
    updatePayConfig:(req,callback)=>{
        return new Promise((resolve,reject)=>{
            const updatePayConfigValidation = schemaValidation(UpdatePayconfigShema)(req.body)
            if(updatePayConfigValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:updatePayConfigValidation.message}))
            }
        }).then(()=>{
            return PayConfig.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }
                }
            })
        }).then(payconfig=>{
            return new Promise((resolve,reject)=>{
                if(!payconfig){
                    return reject(new RecordNotFoundErr())
                }
                if(payconfig.User && payconfig.User.Role.weight<=req.role.weight && req.user.id!=payconfig.addedBy){

                    return reject(new UnauthorizedError({specific:'you cannot update a record added by a higher user'}))
                }
                return resolve(payconfig)

            })
        }).then(payconfig=>{
            return payconfig.update(req.body)
        }).then(payconfig=>{
            callback(null,payconfig)
        }).catch(e=>{
            if(e instanceof RecordNotFoundErr || e instanceof UnauthorizedError || e instanceof ValidationError){
                callback(e)
            } 
            else{
                callback(new SqlError(e))
            }  
            

        })
    },
    destroyPayConfig:(req,callback)=>{
       
            return PayConfig.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }
                }
            
        }).then(payconfig=>{
            return new Promise((resolve,reject)=>{
                if(!payconfig){
                    return reject(new RecordNotFoundErr())
                }
                if(payconfig.User && payconfig.User.Role.weight<=req.role.weight && req.user.id!==payconfig.addedBy){

                    return reject(new UnauthorizedError({specific:'you cannot update a record added by a higher user'}))
                }
                return resolve(payconfig)

            })
        }).then(payconfig=>{
            return payconfig.destroy()
        }).then(payconfig=>{
            callback(null,payconfig)
        }).catch(e=>{
            if(e instanceof RecordNotFoundErr || e instanceof UnauthorizedError ){
                callback(e)
            } 
            else{
                callback(new SqlError(e))
            }  
            

        })
    },
    updateCard:(req,callback)=>{
        return new Promise((resolve,reject)=>{
            const bodyValidaion = schemaValidation(UpdateCardShema)(req.body)
            if(bodyValidaion.isValid){
                return reject(new ValidationError({message:bodyValidaion.message}))
            }
            else{
                return resolve()
            }

        }).then(()=>{
            return Card.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    attributes:['addedBy'],
                    include:{
                        model:Role,
                        foreignKey:'role_id',
                        attributes:['weight']
                    }
                }
    
            })
        })
        .then(c=>{
            if(c){
                if(c.User && c.User.Role.weight<=req.role.weight && c.addedBy!=req.user.id){
                    return Promise.reject(new UnauthorizedError())
                }
                else{
                    return c
                }
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        }).then(c=>{
            return c.update(req.body)
        }).then(c=>{
            callback(null,c)

        }).catch(e=>{
            callback(resolveError(e))
        })


    },
    deleteCard:(req,callback)=>{
        Card.findByPk(req.params.id,   
            {include:{
            model:User,
            foreignKey:'addedBy',
            attributes:['addedBy'],
            include:{
                model:Role,
                foreignKey:'role_id',
                attributes:['weight']
            }
        }}).then(c=>{
            if(c){
                if(c.User && c.User.Role.weight<=req.role.weight && c.addedBy!=req.user.id){
                    return Promise.reject(new UnauthorizedError())
                }
                else{
                    return c
                }
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        }).then(c=>{
            return c.destroy()

        }).then(()=>{
            callback(null,{})
        }).catch(e=>{
            callback(resolveError(e))

        })

    }
    



}