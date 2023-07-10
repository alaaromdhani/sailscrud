const joi = require('joi')
const SoftskillsvideoShema = joi.object({
    
    name: joi.string().required(),
    description: joi.string(),
    theme_id: joi.number().required(),
    source: joi.array().items(["youtube","vimeo"]).required(),
    url: joi.string().required(),
    
})
const UpdateSoftskillsvideoShema = joi.object({
    
    name: joi.string(),
    description: joi.string(),
    theme_id: joi.number(),
    source: joi.array().items(["youtube","vimeo"]),
    url: joi.string(),
    
})
module.exports = {SoftskillsvideoShema,UpdateSoftskillsvideoShema}
