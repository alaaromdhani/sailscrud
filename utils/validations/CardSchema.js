const joi = require('joi')
const UpdateCardShema = joi.object({
    
    code: joi.string(),
    
})
module.exports = UpdateCardShema
