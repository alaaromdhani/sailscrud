const joi = require('joi')
const PackShema = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    duration:joi.number().required(),
   
    
})
const PackShemaWithoutFile = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    duration:joi.number().required(),
    photo:joi.number().required()
    
    
})
const UpdatePackShema = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    duration:joi.number().required(),
   
    photo:joi.number().required()
    
})
module.exports = {PackShema,PackShemaWithoutFile,UpdatePackShema}
