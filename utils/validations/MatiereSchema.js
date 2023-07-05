const joi = require('joi')
const MatiereShema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    color: joi.string().required(),
    ns:joi.array().items(joi.object({
         name:joi.string().required(),
         NiveauScolaireId:joi.number().required()  
    }))
})
const UpdateMatiereShema = joi.object({
  name: joi.string(),
  description: joi.string(),
  color: joi.string(),
  active:joi.boolean(),
  ns:joi.array().items(joi.object({
    name:joi.string().required(),
    NiveauScolaireId:joi.number().required()  
  }))
})
module.exports = {MatiereShema,UpdateMatiereShema}
