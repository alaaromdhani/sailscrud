const joi = require('joi')
const SmsShema = joi.object({
    content: joi.string().required(),
    reciever_id: joi.number().integer(),
    group_id: joi.number().integer(),
    susbcriber: joi.any(),
   
})
module.exports = SmsShema
