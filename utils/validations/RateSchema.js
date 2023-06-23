const joi = require('joi')
const RateShema = joi.object({
  rating: joi.number().less(sails.config.custom.ratings.maxValue).greater(sails.config.custom.ratings.minValue).required(),
})
module.exports = RateShema
