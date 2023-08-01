const joi = require('joi')
const ValidateSchema = joi.object({
    validity:joi.boolean().required()


})
module.exports = ValidateSchema