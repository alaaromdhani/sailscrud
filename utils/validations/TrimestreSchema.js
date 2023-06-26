const joi = require('joi')
const TrimestreShema = joi.object({
    name_fr: joi.string().required(),
    name_ar: joi.string().required(),
})
const UpdateTrimestreShema = joi.object({
  name_fr: joi.string(),
  name_ar: joi.string(),
})
module.exports = {TrimestreShema,UpdateTrimestreShema}
