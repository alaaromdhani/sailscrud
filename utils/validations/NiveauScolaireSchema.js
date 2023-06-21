const joi = require('joi')
const Sequelize = require('sequelize');
const NiveauScolaireShema = joi.object({
  name_fr: joi.string().required(),
  name_ar: joi.string().required()
})
const UpdateNiveauScolaireShema = joi.object({
  name_fr: joi.string(),
  name_ar: joi.string(),
  active:joi.boolean()
})
module.exports = {NiveauScolaireShema,UpdateNiveauScolaireShema}
