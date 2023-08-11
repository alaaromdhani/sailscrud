const joi = require('joi')
const CoachingVideoShema = joi.object({
    name:joi.string().required(),
    description:joi.string(),
    source:joi.string().valid('youtube','vimeo').required(),
    url:joi.string().uri().required(),
    theme_id:joi.number().required()
})
const UpdateCoachingVideoShema = joi.object({
  name:joi.string(),
  description:joi.string(),
  source:joi.string().valid('youtube','vimeo'),
  url:joi.string().uri(),
  isDeleted:joi.boolean(),
  theme_id:joi.number()
})
module.exports = {CoachingVideoShema,UpdateCoachingVideoShema}
