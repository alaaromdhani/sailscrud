const joi = require('joi')
const LivraisonShema = joi.object({
        order_code:joi.string().required(),
        adresse_id:joi.number().integer().required()
})
const UpdateLivraisonShema = joi.object({
    status:joi.string().valid('active'),
})
module.exports = {LivraisonShema,UpdateLivraisonShema}
