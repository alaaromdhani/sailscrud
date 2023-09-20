const joi = require('joi')
const TeacherperchaseShema = joi.object({
    annee_niveau_classrooms:joi.array().items(joi.number().integer()).required()
})
module.exports = TeacherperchaseShema
