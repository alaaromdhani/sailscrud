const joi = require('joi')
const ValidateSchema = joi.object({
    phonenumber:joi.string().required(),
    code:joi.boolean().required(),
    password:joi.string().required(),
    conf_pass:joi.string().required()
    


})
module.exports = {ValidateSchema}