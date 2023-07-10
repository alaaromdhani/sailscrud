const joi = require('joi')
const SoftskillsinteractiveShema = joi.object({
    
    name: joi.string().required(),
    description: joi.string(), 
    parent:joi.number().required(),
    
   
    
})
const UpdateSoftskillsinteractiveShema = joi.object({
    
    name: joi.string(),
    description: joi.string(), 
    parent:joi.number(),
    
   
    
})
module.exports = {SoftskillsinteractiveShema,UpdateSoftskillsinteractiveShema}
