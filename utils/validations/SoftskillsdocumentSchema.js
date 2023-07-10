const joi = require('joi')
const SoftskillsdocumentShema = joi.object({
    
    name: joi.string().required(),
    description: joi.string(),
    theme_id: joi.number().required(),
    
})
const UpdateSoftskillsdocumentShema = joi.object({
    
    name: joi.string(),
    description: joi.string(),
    theme_id: joi.number(),
    
})
module.exports = SoftskillsdocumentShema
