const joi = require('joi')
const AnneeScolaireShema = joi.object({
    startingYear:joi.number().integer().required(),
    endingYear:joi.number().integer().required()
})
const updateAnneeScolaire = joi.object({
    startingYear:joi.number().integer(),
    endingYear:joi.number().integer(),
    active:joi.boolean(),
})
module.exports = {AnneeScolaireShema,updateAnneeScolaire}
