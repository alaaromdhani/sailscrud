const joi = require('joi')
const SoftskillsthemeShema = joi.object({
    
    name: joi.string().required(),
    
    description: joi.string(),
    
})
const UpdateSoftskillsthemeShema = joi.object({
    
    name: joi.string(),
    
    description: joi.string(),
    
})
module.exports = {SoftskillsthemeShema,UpdateSoftskillsthemeShema}
