const joi = require('joi')
const SubscriberShema = joi.object({
    
    identifier: joi.string().required(),

    
})
const UpdateSubscriberShema = joi.object({
    
    identifier: joi.string().required(),

    
})
module.exports = {SubscriberShema,UpdateSubscriberShema}
