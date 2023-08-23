const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
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
    



}