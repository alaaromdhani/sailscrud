const joi = require('joi')
const CoursDocumentShema = joi.object({
    name: joi.string().required(),
    description:joi.string().required(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string().required(),
    parent:joi.number().required(),
   
})
const CoursDocumentShemaWithFile = joi.object({
    name: joi.string().required(),
    description:joi.string().required(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string().required(),
    parent:joi.number().required(),
    document:joi.number().required()
})
const UpdateCoursDocumentShema = joi.object({
    name: joi.string(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string(),
    parent:joi.number(),
    validity:joi.boolean(),
    active:joi.boolean(),
    document:joi.number()
})
module.exports = {CoursDocumentShema,UpdateCoursDocumentShema,CoursDocumentShemaWithFile}


