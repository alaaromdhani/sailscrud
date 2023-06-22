const joi = require('joi')
const {number} = require('joi');
const MatiereShema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    color: joi.string().required(),
    ns:joi.array().items(joi.number())
})
const UpdateMatiereShema = joi.object({
  name: joi.string(),
  description: joi.string(),
  color: joi.string(),
  active:joi.boolean(),
  ns:joi.array().items(joi.number())
})
module.exports = {MatiereShema,UpdateMatiereShema}
