const joi = require('joi')
const PrepaidcardShema = joi.object({
    name: joi.string().required(),
    nbre_cards: joi.number().integer().required(),
    pack_id:joi.number().integer().required()
})
const PrepaidcardShemaWithoutFile = joi.object({
    name: joi.string().required(),
    nbre_cards: joi.number().integer().required(),
    pack_id:joi.number().integer().required(),
    photo:joi.number().integer().required()


})
const UpdatePrepaidcardShema = joi.object({
    name: joi.string().required(),
    nbre_cards: joi.number().integer().required(),
    pack_id:joi.number().integer().required(),
    photo:joi.number().integer().required()
})
module.exports = {PrepaidcardShema,PrepaidcardShemaWithoutFile,UpdatePrepaidcardShema}
