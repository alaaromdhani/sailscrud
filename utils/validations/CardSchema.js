const joi = require('joi')
const CreateCardShema = joi.object({
    
    livraison_id:joi.number().integer().required(),


    
})
const UpdateCardShema = joi.object({
    
    code: joi.string(),
    used:joi.boolean()
    
})
module.exports = {UpdateCardShema,CreateCardShema}
