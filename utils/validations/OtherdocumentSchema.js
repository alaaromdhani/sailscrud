const joi = require('joi')
const OtherdocumentShemaWithUpload = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    parent: joi.number().integer().required(),
})
const OtherdocumentShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    parent: joi.number().integer().required(),
    document:joi.number().integer().required()
})
const UpdatedocumentShemaWithUpload = joi.object({
    name: joi.string(),
    description: joi.string(),
    active:joi.boolean(),
    status:joi.string().valid('public','private'),
    parent: joi.number().integer()
})
const UpdatedocumentShema = joi.object({
    name: joi.string(),
    description: joi.string(),
    active:joi.boolean(),
    status:joi.string().valid('public','private'),
    parent: joi.number().integer()
})


module.exports = {UpdatedocumentShema,UpdatedocumentShemaWithUpload,OtherdocumentShema,OtherdocumentShemaWithUpload}
