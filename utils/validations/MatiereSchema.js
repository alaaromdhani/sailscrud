const joi = require('joi')
const MatiereShema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    domaine_id:joi.number().required(),
    color: joi.string().required(),
    ns:joi.array().items(joi.object({
         name:joi.string().required(),
         NiveauScolaireId:joi.number().required(),  
         intern_teacher:joi.number().required(),
         nb_modules:joi.number().less(sails.config.custom.nb_chapitres+1).required(),
         inspector:joi.number().required(),
         
    })),
    image:joi.number().integer().required()
})
const MatiereShemaWithUpload = joi.object({
  name: joi.string().required(),
  description: joi.string().required(),
  domaine_id:joi.number().required(),
  color: joi.string().required(),
  ns:joi.array().items(joi.object({
       name:joi.string().required(),
       NiveauScolaireId:joi.number().required(),  
       intern_teacher:joi.number().required(),
       nb_modules:joi.number().less(sails.config.custom.nb_chapitres+1).required(),
       inspector:joi.number().required(),
       
  }))
})
const UpdateMatiereShema = joi.object({
  name: joi.string(),
  description: joi.string(),
  color: joi.string(),
  domaine_id:joi.number(),
  active:joi.boolean(),
  ns:joi.array().items(joi.object({
    name:joi.string().required(),
    NiveauScolaireId:joi.number().required(),  
    nb_modules:joi.number().less(sails.config.custom.nb_chapitres+1),
    intern_teacher:joi.number().required(),
    inspector:joi.number().required()
  })),
  image:joi.number().integer()
  
})
const UpdateMatiereShemaWithUpload = joi.object({
  name: joi.string(),
  description: joi.string(),
  color: joi.string(),
  domaine_id:joi.number(),
  active:joi.boolean(),
  ns:joi.array().items(joi.object({
    name:joi.string().required(),
    NiveauScolaireId:joi.number().required(),  
    nb_modules:joi.number().less(sails.config.custom.nb_chapitres+1),
    intern_teacher:joi.number().required(),
    inspector:joi.number().required()
  }))
  
})
module.exports = {MatiereShema,UpdateMatiereShema,UpdateMatiereShemaWithUpload,MatiereShemaWithUpload}
