const joi = require('joi')
const CountryShema = joi.object({
    
    code: joi.string().required(),
    
    name: joi.string().required(),

})
const UpdateCountrySchema = joi.object({
    
    code: joi.string(),
    
    name: joi.string(),
    active:joi.boolean()
,
       
})
module.exports = {CountryShema,UpdateCountrySchema}
