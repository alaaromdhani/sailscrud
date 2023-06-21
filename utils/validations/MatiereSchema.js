const joi = require('joi')
const MatiereShema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    color: joi.string().required(),
})
const UpdateMatiereShema = joi.object({
  name: joi.string(),
  description: joi.string(),
  color: joi.string(),
  active:joi.boolean()
})
module.exports = {MatiereShema,UpdateMatiereShema}
