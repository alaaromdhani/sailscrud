const joi = require('joi')
const PermissionShema = require('./PermissionSchema')
const UserShema = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string().required(),
    username: joi.string().required(),
    phonenumber: joi.string().required(),
    password: joi.string().required(),
    birthDate:joi.string().required(),
    role_id:joi.number().integer(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),

})
const registerSchema = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string().required(),
    username: joi.string().required(),
    phonenumber: joi.string().required(),
    birthDate:joi.string().required(),
    password: joi.string().required(),
    country_id:joi.number().integer().required(),
    state_id:joi.number().integer().required(),
})
const updateUserSchema= joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string(),
    username: joi.string(),
    phonenumber: joi.string(),
    birthDate:joi.string().required(),
   permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
    country_id:joi.number().integer().required(),
    state_id:joi.number().integer().required(),
})
module.exports = {UserShema,updateUserSchema,registerSchema}
