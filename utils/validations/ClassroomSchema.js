const joi = require('joi')
const ClassroomShema = joi.object({
    niveau_scolaire_id: joi.number().integer().required(),
})

module.exports = ClassroomShema
