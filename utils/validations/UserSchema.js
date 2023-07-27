const joi = require('joi')
const PermissionShema = require('./PermissionSchema')
const UserShema = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string().required(),
    username: joi.string().required(),
    phonenumber: joi.string().regex(/^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/).required(),
    password: joi.string().required(),
    birthDate:joi.string().required(),
    sex:joi.string().valid('M','F'),    
    role_id:joi.number().integer(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),

})
const registerSchema = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string().required(),
    username: joi.string().required(),
    phonenumber: joi.string().regex(/^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/).required(),
    birthDate:joi.string().required(),
     sex:joi.string().valid('M','F'),    
    password: joi.string().required(),
    country_id:joi.number().integer().required(),
    state_id:joi.number().integer().required(),
})
const updateUserSchema= joi.object({
    firstName:joi.string(),
    lastName:joi.string(),
    email: joi.string(),
    isDeleted: joi.boolean(),
    sex:joi.string().valid('M','F'),    
    username: joi.string(),
    phonenumber: joi.string(),
    birthDate:joi.string(),
   permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
    country_id:joi.number().integer(),
    state_id:joi.number().integer(),
})
const profileUpdate= joi.object({
    
    sex:joi.string().valid('M','F'),    
    firstName:joi.string(),
    lastName:joi.string(),
    email: joi.string(),
    newPassword: joi.string(),
    oldPassword: joi.string(),
    preferredLanguage:joi.string(),
    username: joi.string(),
    phonenumber: joi.string().regex(/^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/),
    birthDate:joi.string(),
    country_id:joi.number(),
    state_id:joi.number(),
})
module.exports = {UserShema,updateUserSchema,registerSchema,profileUpdate}
