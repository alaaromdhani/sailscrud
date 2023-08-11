const joi = require('joi')

const CoursDocumentShema = joi.object({
    name: joi.string().required(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    parent:joi.number().required(),
    forTeacher:joi.boolean(),
   
})
const CoursDocumentShemaWithFile = joi.object({
    name: joi.string().required(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    parent:joi.number().required(),
    document:joi.number().required(),
    forTeacher:joi.boolean(),
})

const UpdateCoursDocumentShema = joi.object({
    name: joi.string(),
    description:joi.string().allow(''),
    status: joi.string().valid('public','private'),
    parent:joi.number(),
    validity:joi.boolean(),
    active:joi.boolean(),
    document:joi.number(),
    forTeacher:joi.boolean(),
})

module.exports = {CoursDocumentShema,UpdateCoursDocumentShema,CoursDocumentShemaWithFile}


