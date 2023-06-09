const jwt = require('jsonwebtoken')
const { ErrorHandlor } = require('../../utils/translateResponseMessage')
const UnauthorizedError = require('../../utils/errors/UnauthorizedError')
const UnkownError = require('../../utils/errors/UnknownError')
const jwt_config = sails.config.custom.jwt
module.exports= (req,res,next)=>{
    
    if(req.session.authenticated && req.user){
        if(!req.user.isDeleted){
            if(!req.cookies || !req.cookies.token){
                ErrorHandlor(req,new UnauthorizedError(err),res)
            }
            else{
                jwt.verify(req.cookies.token,jwt_config.jwt_secret,(err,token)=>{
                    if(err){
                        req.logout(async function(err) {
                            if (err) {  ErrorHandlor(req,new UnkownError(err),res)}
                            else{
                                req.session.authenticated = false
                                delete req.user
                                await UserToken.update({isTokenExpired:true},{where:{token}})
                                ErrorHandlor(req,new UnauthorizedError(err),res)
                            }
                        });
                    }
                    else{
                        UserToken.findAll({where:{user_id:req.user.id,isTokenExpired:false}}).then(userTokens=>{
                            
                            const currentToken = userTokens.filter(t=>t.token==req.cookies.token).at(0)
                            if(currentToken){
                                req.currentToken = currentToken
                                req.availableToken=userTokens
                                next()
                            }
                            else{
                                ErrorHandlor(req,new UnauthorizedError(err),res)                    
    
                            }
    
    
                        })
                    }
    
    
    
                })
    
            }
    
        }
        else{
            ErrorHandlor(req,new UnauthorizedError(),res)
            
        }

    }
    else{
        ErrorHandlor(req,new UnauthorizedError(),res)
    }

   




}