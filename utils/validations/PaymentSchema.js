const joi = require('joi')
const PaymentShema = joi.object({
    
    amount: joi.number().required(),
    seller_id: joi.number().integer().required(),
    
})
const paymentUpdate = joi.object({
    amount: joi.number(),
    seller_id: joi.number().integer(),
})
module.exports = {paymentUpdate,PaymentShema}
