const joi = require('joi')
const CoursVideoShema = joi.object({
    name: joi.string().required(),
    description:joi.string().required(),
    status: joi.string().valid('public','private'),
    source: joi.string().valid('vimeo','youtube').required(),
    url:joi.string().uri().required(),
    commentaire:joi.string().required(),
    parent:joi.number().required()
})
const UpdateCoursVideoShema = joi.object({
    name: joi.string(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    commentaire:joi.string(),
    parent:joi.number(),
    validity:joi.boolean(),
    source: joi.string().valid('vimeo','youtube'),
    url:joi.string().uri(),
    active:joi.boolean()
})
module.exports = {CoursVideoShema,UpdateCoursVideoShema}

