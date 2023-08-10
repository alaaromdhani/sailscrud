const joi = require('joi')
module.exports={
    createStudentSchema:joi.object({
        firstName:joi.string().required(),
        lastName:joi.string().required(),
        sex:joi.string().valid('M','F').required(),
        niveau_scolaire_id:joi.number().integer().required(),
       password:joi.string().required() 
        
    })


}