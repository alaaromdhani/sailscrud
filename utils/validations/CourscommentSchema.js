const joi = require('joi')
const CourscommentShema = joi.object({
    content: joi.string().required(),
})

module.exports = CourscommentShema
