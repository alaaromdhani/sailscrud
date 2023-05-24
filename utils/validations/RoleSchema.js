const joi = require('joi')
const PermissionShema = require('./PermissionSchema')
const RoleShema = joi.object({
    
    name: joi.string().required(),
    
    weight: joi.number().integer().required(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
    
})
const updateRoleShema = joi.object({
    
    name: joi.string(),
    
    weight: joi.number().integer(),
    permissions: joi.array().items(PermissionShema).allow(null),
    features:joi.array().items(joi.string()).allow(null),
    
})
module.exports = {RoleShema,updateRoleShema}
