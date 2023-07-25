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
    
    name: joi.string(),
    price: joi.number(),
    duration:joi.number(),
   
    
    
})
const UpdatePackShemaWithoutFile = joi.object({
    
    name: joi.string(),
    price: joi.number(),
    duration:joi.number(),
  photo:joi.number()
    
})
module.exports = {PackShema,PackShemaWithoutFile,UpdatePackShema,UpdatePackShemaWithoutFile}
