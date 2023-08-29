const joi = require('joi')
module.exports={
    createStudentSchema:joi.object({
        firstName:joi.string().required(),
        lastName:joi.string().required(),
        niveau_scolaire_id:joi.number().integer().required(),
        sex:joi.string().valid('M','F').required(),
        birthDate:joi.string().required(),
       password:joi.string().required(),

        
    }),
    updateStudentSchema:joi.object({
        firstName:joi.string(),
        lastName:joi.string(),
        sex:joi.string().valid('M','F'),
        birthDate:joi.string(),
        password:joi.string(),
        username:joi.string()
    })



}