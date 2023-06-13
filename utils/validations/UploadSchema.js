const joi = require('joi')
const UploadShema = joi.object({
    
    file_original_name: joi.string().required(),
    
    file_name: joi.string().required(),
    
    type: joi.string().required(),
    
    file_size: joi.number().integer(),
    
    extension: joi.string().required(),
    
})
const updateUploadShema = joi.object({
    
    file_original_name: joi.string(),
    type: joi.string(),
    isPublic:joi.boolean(),
    isDeleted:joi.boolean()

    
})
module.exports = {UploadShema,updateUploadShema}
