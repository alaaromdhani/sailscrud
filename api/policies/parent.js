const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
    if(req.role.name === sails.config.custom.roles.parent.name){
            console.log('parent passed by here')
            return next()

    }
    else{
        return ErrorHandlor(req,new UnauthorizedError(),res)
    }

}