const joi = require('joi')
const PermissionShema = require('./PermissionSchema')
const UserShema = joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email: joi.string().required(),
    phonenumber: joi.number().integer().required(),
    password: joi.string().required(),
    sex:joi.string().valid('M','F'),    
    role_id:joi.number().integer(),
    country_id:joi.number().integer().required(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),

})
const registerSchema = joi.object({
    firstName:joi.string().required(),  
    lastName:joi.string().required(),  
    email: joi.string().required(),
    phonenumber: joi.string().required(),
    password: joi.string().required(),
    country_id:joi.number().integer().required(),
    state_id:joi.number().integer().required(),
    role:joi.string().valid('teacher','parent').required(),
    gReCaptchaToken:joi.string().required()
})
const updateUserSchema= joi.object({
    firstName:joi.string(),
    lastName:joi.string(),
    email: joi.string(),
    isDeleted: joi.boolean(),
    sex:joi.string().valid('M','F'),    
    phonenumber: joi.string(),
    password: joi.string(),
    
    country_id:joi.number().integer(),
    state_id:joi.number().integer(),
})
const updateNormalUserProfile= joi.object({
    birthDate:joi.string(),
    firstName:joi.string(),
    lastName:joi.string(),
    email: joi.string(),
    sex:joi.string().valid('M','F'),    
    newPassword: joi.string(),
    oldPassword:joi.string(),
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
    phonenumber: joi.string(),
    birthDate:joi.string(),
    country_id:joi.number(),
    state_id:joi.number(),
})
module.exports = {UserShema,updateUserSchema,registerSchema,profileUpdate,updateNormalUserProfile}
