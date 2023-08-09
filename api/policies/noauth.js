const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
    if(req.user){
        return ErrorHandlor(req,new UnauthorizedError(),res)
    }
    else{
        return next()
    }




}