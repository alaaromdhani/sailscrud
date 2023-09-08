const joi = require('joi')
const OrderShema = joi.object({
    annee_niveau_users:joi.array().items(joi.number().integer()).required()
})
const CartPriceCalculation = joi.object({
    annee_niveau_users:joi.array().items(joi.number().integer()).required()
})
const UpdateOrderShema = joi.object({
   status:joi.string()
})
const trimestreVerifier = joi.object({
    nbTrimestres:joi.array().items(joi.number().integer()).required()
})
const tryCouponSchema = joi.object({
    code:joi.string().required()
})
const prepaidCartPayment = joi.object({
    code:joi.string().required()
})
module.exports = {OrderShema,UpdateOrderShema,trimestreVerifier,tryCouponSchema,CartPriceCalculation,prepaidCartPayment}
