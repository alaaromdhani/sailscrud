const joi = require('joi')
const SoftskillsdocumentShema = joi.object({
    
    name: joi.string().required(),
    description: joi.string(),
    theme_id: joi.number().required(),
    
})
const SoftskillsdocumentShemaWithDocument = joi.object({
    
    name: joi.string().required(),
    description: joi.string(),
    theme_id: joi.number().required(),
    document: joi.number().required(),
    
})
const UpdateSoftskillsdocumentShema = joi.object({
    
    name: joi.string(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    parent:joi.number(),
    validity:joi.boolean(),
    active:joi.boolean(),
    document:joi.number()
    
})
module.exports = {SoftskillsdocumentShema,UpdateSoftskillsdocumentShema,SoftskillsdocumentShemaWithDocument}
