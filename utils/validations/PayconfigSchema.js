const joi = require('joi')
const PayconfigShema = joi.object({
    
    name: joi.string().required(),
    
})
const UpdatePayconfigShema = joi.object({
    
    name: joi.string(),
    
})
module.exports = {PayconfigShema,UpdatePayconfigShema}
