const joi = require('joi')
const AdresseShema = joi.object({
    
    adresse: joi.string().required(),
    state_id:joi.number().required(),
    postal_code: joi.string().required(),
    order_code:joi.string().required()
    
})
const updateAdressSchema = joi.object({
    
    adresse: joi.string(),
    state_id:joi.number(),
    postal_code: joi.string(),
})
module.exports = {AdresseShema,updateAdressSchema}
