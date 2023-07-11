const joi = require('joi')
const SoftskillsvideoShema = joi.object({
    
    name: joi.string().required(),
    description: joi.string(),
    parent:joi.number().required(),
    
    source: joi.string().valid('youtube','vimeo').required(),
    url: joi.string().required(),
    
})
const UpdateSoftskillsvideoShema = joi.object({
    
    name: joi.string(),
    description: joi.string(),
    parent:joi.number(),
    source: joi.string().valid('youtube','vimeo'),
    url:joi.string().uri(),
    status: joi.string().valid('public','private'),
    validity:joi.boolean(),
    active:joi.boolean()
    
})
module.exports = {SoftskillsvideoShema,UpdateSoftskillsvideoShema}
