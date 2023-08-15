const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
    if(req.role.name === sails.config.custom.roles.teacher.name || req.role.name === sails.config.custom.roles.parent.name){
          //  console.log('parent passed by here')
            return next()

    }
    else{
        sails.services.userservice.logout(req,(err,data)=>{
            if(err){
              return ErrorHandlor(req,err,res)
             }  
             else{
              return ErrorHandlor(req,new UnauthorizedError(),res)
             }
        })
    }

}