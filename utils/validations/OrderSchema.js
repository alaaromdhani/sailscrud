const joi = require('joi')
const OrderShema = joi.object({
    trimestres:joi.array().items(joi.number().integer()).required(),
    studentId:joi.number().integer().required(),
    niveau_scolaire_id:joi.number().integer().required()
})
const UpdateOrderShema = joi.object({
    trimestres:joi.array().items(joi.number().integer()).required(),
    studentId:joi.number().integer().required(),
    niveau_scolaire_id:joi.number().integer().required()
})
module.exports = {OrderShema,UpdateOrderShema}
