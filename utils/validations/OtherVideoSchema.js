const joi = require('joi')
const OtherVideoShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    parent:joi.number().integer().required(),
    source: joi.string().valid('youtube','vimeo').required(),
    url: joi.string().required(),
    
})
const UpdateOtherVideoShema = joi.object({
    name: joi.string(),
    active:joi.boolean(),
    status:joi.string().valid('public','private'),
    description: joi.string(),
    parent: joi.number().integer(),
    source: joi.string().valid('youtube','vimeo'),
    url: joi.string(),
 
})
module.exports = {OtherVideoShema,UpdateOtherVideoShema}
