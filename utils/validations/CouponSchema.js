const joi = require('joi')
const CouponShema = joi.object({
    
    
    limit: joi.number().integer().required(),
    
    used: joi.number().integer(),
    
    reduction: joi.number().integer().required(),
    
})
const UpdateCouponShema = joi.object({
    
    
    limit: joi.number().integer(),
    
    used: joi.number().integer(),
    
    reduction: joi.number().integer(),
    
})
module.exports = {CouponShema,UpdateCouponShema}
