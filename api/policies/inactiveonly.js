const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports=async (req,res,next)=>{
    if(req.user && req.session.authenticated && !req.user.active){

        return next()
    }
    else{
        return ErrorHandlor(req,new UnauthorizedError({specific:'you can not access this ressourse'}),res)
    }
}