const joi = require('joi')
const DomaineShema = joi.object({
    name: joi.string().required(),
    color: joi.string().required(),
})
const UpdateDomaineShema = joi.object({
    name: joi.string(),
    color: joi.string(),
    status:joi.boolean()
})
module.exports = {DomaineShema,UpdateDomaineShema}
