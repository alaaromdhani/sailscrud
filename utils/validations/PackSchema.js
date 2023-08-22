const joi = require('joi')
const PackShema = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    nbTrimestres:joi.number().integer().required()
   
    
})
const PackShemaWithoutFile = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    photo:joi.number().required(),
    nbTrimestres:joi.number().integer()
    
    
})
const UpdatePackShema = joi.object({
    
    name: joi.string(),
    price: joi.number(),
    nbTrimestres:joi.number().integer()
   
    
    
})
const UpdatePackShemaWithoutFile = joi.object({
    
    name: joi.string(),
    price: joi.number(),
  photo:joi.number(),
  nbTrimestres:joi.number().integer()
    
})
module.exports = {PackShema,PackShemaWithoutFile,UpdatePackShema,UpdatePackShemaWithoutFile}
