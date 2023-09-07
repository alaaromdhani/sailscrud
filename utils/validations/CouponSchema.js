const joi = require('joi')
const CouponShema = joi.object({
    
    
    limit: joi.number().integer().required(),
    
    used: joi.number().integer(),
    type:    joi.string(),
    reduction: joi.number().required(),
    expiredDate: joi.string(),
 
    
})
const UpdateCouponShema = joi.object({
    
    
    limit: joi.number().integer(),
    type:    joi.string(),
    used: joi.number().integer(),
    
    reduction: joi.number(),
    expiredDate: joi.string(),
    
    
})
module.exports = {CouponShema,UpdateCouponShema}
