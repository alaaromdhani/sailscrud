const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports =(req,res,next)=>{
    if(req.session.authenticated&&req.user && !req.user.active){
        return next()
    }
    else{
        return ErrorHandlor(req,new UnauthorizedError(),res)
    }
}