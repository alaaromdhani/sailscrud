const joi = require('joi')
const SellerShema = joi.object({
    name: joi.string().required(),
    address: joi.string().required(),
    state_id:joi.number().integer().required(),  
    postal_code: joi.string().required(),
    phone_number: joi.string().required(),
})
const UpdateSellerShema = joi.object({
    name: joi.string().required(),
    address: joi.string().required(),
    state_id:joi.number().integer().required(),  
    postal_code: joi.string().required(),
    phone_number: joi.string().required(),
})
module.exports = {SellerShema,UpdateSellerShema}
