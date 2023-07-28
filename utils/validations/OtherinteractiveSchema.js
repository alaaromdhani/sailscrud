const joi = require('joi')
const OtherinteractiveShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    tracked:joi.boolean(),
    parent:joi.number().integer().required(),
})
const UpdateOtherIntercativeSchema = joi.object({
    id: joi.string(),
    name: joi.string(),
    description: joi.string(),
    status: joi.string().valid('public','private'),
    active: joi.boolean(),
})
module.exports = {OtherinteractiveShema,UpdateOtherIntercativeSchema}
