const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { paymentUpdate } = require("../../utils/validations/PaymentSchema")
const { ValidateSchema } = require("../../utils/validations/VerificationCodeSchema")

module.exports = {
    updatePayment:(req)=>{
        return new Promise((resolve,reject)=>{
            const bodyValidation = schemaValidation(paymentUpdate)(req.body)
            if(bodyValidation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:bodyValidation.message}))
            }
        }).then(()=>{
            return Payment.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    as:'Adder',
                    attributes:['role_id'],
                    include:{
                         model: Role,
                         foreignKey:'role_id',
                         attributes:['weight']
                         
                   }
                }
            })
        }).then(c=>{
             if(c){
                if(req.role.weight>=c.Adder.Role.weight && req.user.id!=c.addedBy ){
                return Promise.reject(new UnauthorizedError())
                }
                req.body.updatedBy=1
                 return c.update(req.body)
            }
           
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        })

    },
    deletePayment:(req)=>{

            return Payment.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    as:'Adder',
                    attributes:['role_id'],
                    include:{
                         model: Role,
                         foreignKey:'role_id',
                         attributes:['weight']
                         
                   }
                }
        }).then(c=>{
            if(c){
                if(req.role.weight>=c.Adder.Role.weight && req.user.id!=c.addedBy ){
                return Promise.reject(new UnauthorizedError())
                }
                 return c.destroy()
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }
        })

    }


}