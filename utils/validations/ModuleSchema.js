const joi = require('joi')
const ModuleShema = joi.object({
    
    name: joi.string().required(),
    chapitre_id:joi.number().required(),
    niveau_scolaire_id:joi.number().required(),
    matiere_id:joi.number().required()

})
const UpdateModuleShema = joi.object({
    modules:joi.array().items(joi.object({
        id:joi.number().required(),
        name:joi.string().required(),
        chapitre_id:joi.number().required(),
        trimestres:joi.array().items(joi.number().integer())
    }))

})
module.exports = {ModuleShema,UpdateModuleShema}
