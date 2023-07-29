const joi = require('joi')
const CourseShema = joi.object({
  name: joi.string().required(),
  matiere_id:joi.number().required(),
  module_id:joi.number(),
  trimestre_id:joi.number(),
  order:joi.number(),

  niveau_scolaire_id:joi.number().required(),
  description:joi.string().required()
})
const UpdateCourseShema = joi.object({
  name: joi.string(),
  niveau_scoleaire_id:joi.number(),
  module_id:joi.number(),
  order:joi.number(),
  trimestre_id:joi.number(),

  niveau_scolaire_id:joi.number(),
  description:joi.string()
})
module.exports = {CourseShema,UpdateCourseShema}
