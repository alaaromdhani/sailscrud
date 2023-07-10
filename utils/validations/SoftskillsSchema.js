const joi = require('joi')
const SoftskillsShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    theme_id:joi.number().required(),
    ns:joi.array().items(joi.number())
})
const UpdateSoftskillsShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    theme_id:joi.number().required(),
    ns:joi.array().items(joi.number())
})
module.exports = {SoftskillsShema,UpdateSoftskillsShema}
