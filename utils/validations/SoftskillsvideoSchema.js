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
    theme_id: joi.number(),
    source: joi.string().valid('youtube','vimeo').required(),
    url: joi.string(),
    
})
module.exports = {SoftskillsvideoShema,UpdateSoftskillsvideoShema}
