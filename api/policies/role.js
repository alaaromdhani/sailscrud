const UnkownError = require("../../utils/errors/UnknownError")

module.exports = (req,res,next)=>{
 
    
    if(req.user){
        req.role = req.user.Role
        next()
    }
    else{
        Role.findOne({where:{name:'public'}}).then(role=>{
            if(role){
                req.role = role
                next()
            }
            else{
                ErrorHandlor(req,new UnkownError(err),res)

            }



        })

    }




}