const joi = require('joi')
module.exports={
    createStudentSchema:joi.object({
        firstName:joi.string().required(),
        lastName:joi.string().required(),
        sex:joi.string().valid('M','F').required(),
        niveau_scolaire_id:joi.number().integer().required(),
        birthDate:joi.string().required(),
       password:joi.string().required(),

        
    }),
    updateStudentSchema:joi.object({
        firstName:joi.string(),
        lastName:joi.string(),
        sex:joi.string().valid('M','F'),
        niveau_scolaire_id:joi.number().integer(),
        birthDate:joi.string(),
        password:joi.string(),
    })



}