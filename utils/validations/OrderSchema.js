const joi = require('joi')
const OrderShema = joi.object({
    annee_niveau_users:joi.array().items(joi.number().integer()).required()
})
const CartPriceCalculation = joi.object({
    annee_niveau_users:joi.array().items(joi.number().integer()).required()
})
const UpdateOrderShema = joi.object({
    trimestres:joi.array().items(joi.number().integer()).required(),
    studentId:joi.number().integer().required(),
    niveau_scolaire_id:joi.number().integer().required()
})
const trimestreVerifier = joi.object({
    nbTrimestres:joi.array().items(joi.number().integer()).required()
})
const tryCouponSchema = joi.object({
    code:joi.string().required()
})
module.exports = {OrderShema,UpdateOrderShema,trimestreVerifier,tryCouponSchema,CartPriceCalculation}
