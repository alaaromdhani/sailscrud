const joi = require('joi')
const PackShema = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    nbTrimestres:joi.number().integer().required(),
    initialPrice:joi.number().required(),
    reduction:joi.number().required(),
   
    
})
const PackShemaWithoutFile = joi.object({
    
    name: joi.string().required(),
    price: joi.number().required(),
    photo:joi.number().required(),
    nbTrimestres:joi.number().integer(),
    initialPrice:joi.number().required(),
    reduction:joi.number().required(),
    
    
})
const UpdatePackShema = joi.object({
    
    name: joi.string(),
    price: joi.number(),
    nbTrimestres:joi.number().integer(),
    initialPrice:joi.number(),
    reduction:joi.number(),
   
    
    
})
const UpdatePackShemaWithoutFile = joi.object({
    
    name: joi.string(),
    price: joi.number(),
  photo:joi.number(),
  initialPrice:joi.number(),
  reduction:joi.number(),

  nbTrimestres:joi.number().integer()
    
})
module.exports = {PackShema,PackShemaWithoutFile,UpdatePackShema,UpdatePackShemaWithoutFile}
