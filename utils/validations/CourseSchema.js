const joi = require('joi')
const CourseShema = joi.object({
  name: joi.string().required(),
  matiere_id:joi.number().required(),
  chapitre_id:joi.number().required(),
  niveau_scolaire_id:joi.number().required(),
  description:joi.string().required()
})
const UpdateCourseShema = joi.object({
  name: joi.string(),
  niveau_scoleaire_id:joi.number(),
  chapitre_id:joi.number(),
  niveau_scolaire_id:joi.number(),
  description:joi.string()
})
module.exports = {CourseShema,UpdateCourseShema}
