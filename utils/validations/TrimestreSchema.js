const joi = require('joi')
const TrimestreShema = joi.object({
    name_fr: joi.string().required(),
    name_ar: joi.string().required(),
    isSummerSchool:joi.boolean()
})
const UpdateTrimestreShema = joi.object({
  name_fr: joi.string(),
  name_ar: joi.string(),
  isSummerSchool:joi.boolean()
})
module.exports = {TrimestreShema,UpdateTrimestreShema}
