const joi = require('joi')
const OthercourseShema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    type: joi.number().required(),
})
const UpdateOthercourseShema = joi.object({
    name: joi.string(),
    description: joi.string(),
    type: joi.number(),
    active:joi.boolean()
})
module.exports = {OthercourseShema,UpdateOthercourseShema}
