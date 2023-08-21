const joi = require('joi')
const CoursVideoShema = joi.object({
    name: joi.string().required(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    source: joi.string().valid('vimeo','youtube').required(),
    order: joi.number().integer().required(),
    url:joi.string().uri().required(),
    parent:joi.number().required()
})
const UpdateCoursVideoShema = joi.object({
    name: joi.string(),
    description:joi.string(),
    status: joi.string().valid('public','private'),
    parent:joi.number(),
    order: joi.number().integer(),
    validity:joi.boolean(),
    source: joi.string().valid('vimeo','youtube'),
    url:joi.string().uri(),
    active:joi.boolean()
})
module.exports = {CoursVideoShema,UpdateCoursVideoShema}

