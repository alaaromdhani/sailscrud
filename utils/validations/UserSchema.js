const joi = require('joi')
const PermissionShema = require('./PermissionSchema')
const UserShema = joi.object({
    email: joi.string().required(),
    username: joi.string().required(),
    phonenumber: joi.string().required(),
    password: joi.string().required(),
    role_id:joi.number().integer(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
})
const updateUserSchema= joi.object({
    email: joi.string(),
    username: joi.string(),
    phonenumber: joi.string(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
})
module.exports = {UserShema,updateUserSchema}
