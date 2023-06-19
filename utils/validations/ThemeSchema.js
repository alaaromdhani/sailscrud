const joi = require('joi')
const ThemeShema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
})
const UpdateThemeSchema = joi.object({
  name: joi.string(),
  description: joi.string(),
})
module.exports = {ThemeShema,UpdateThemeSchema}
