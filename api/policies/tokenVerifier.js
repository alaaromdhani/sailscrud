const jwt = require('jsonwebtoken')
const { ErrorHandlor } = require('../../utils/translateResponseMessage')
const UnauthorizedError = require('../../utils/errors/UnauthorizedError')
const UnkownError = require('../../utils/errors/UnknownError')
const jwt_config = sails.config.custom.jwt
module.exports= (req,res,next)=>{
    
    if(req.session.authenticated && req.user && req.user.active){
        
        return next()

    }
    else{
        ErrorHandlor(req,new UnauthorizedError(),res)
    }

   




}