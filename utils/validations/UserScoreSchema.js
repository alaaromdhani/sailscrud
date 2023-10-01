const joi = require('joi')
const scoreSchema = joi.object({
    matiere_id:joi.string(),
    niveau_scolaire_id:joi.string(),
    annee_scolaire_id:joi.string(),
    limit:joi.string(),
    


})
module.exports = scoreSchema