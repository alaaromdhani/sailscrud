const joi = require('joi')
const CoursInteractiveShema = joi.object({
    name: joi.string().required(),
    description:joi.string().required(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string().required(),
    parent:joi.number().required()
})
const UpdateCoursInteractiveShema = joi.object({
    name: joi.string(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string(),
    parent:joi.number(),
    validity:joi.boolean(),
    active:joi.boolean()
})
module.exports = {CoursInteractiveShema,UpdateCoursInteractiveShema}
