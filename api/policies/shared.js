const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
    if(req.user&&req.session.authenticated&&req.user.active){
        req.shared = true
        return next()
    }
    else{
        return ErrorHandlor(req,new UnauthorizedError(),res)

    }
}