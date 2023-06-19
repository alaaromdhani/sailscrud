const joi = require('joi')
const PermissionShema = joi.object({

    actions: joi.array().items(joi.string()).required(),
    model: joi.string().required(),
    relation: joi.array().items(joi.string()),

})
module.exports = PermissionShema
