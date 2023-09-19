const joi = require('joi')
const CTypeShemaWithUpload = joi.object({
    name:joi.string().required(),
    description:joi.string(),
    ns:joi.array().items(joi.number().integer())
})
const UpdateCTypeShema = joi.object({
    name:joi.string(),
    description:joi.string(),
    active:joi.boolean(),
    free:joi.boolean(),
    thumbnail:joi.number().integer().required(),
    ns:joi.array().items(joi.number().integer())
})
const UpdateCTypeShemaWithUpload = joi.object({
    name:joi.string(),
    description:joi.string(),
    active:joi.boolean(),
    free:joi.boolean(),
    ns:joi.array().items(joi.number().integer())
})
const CTypeShema = joi.object({
    name:joi.string().required(),
    description:joi.string(),
    thumbnail:joi.number().integer().required(),
    ns:joi.array().items(joi.number().integer())
})
module.exports = {CTypeShema,CTypeShemaWithUpload,UpdateCTypeShema,UpdateCTypeShemaWithUpload}
