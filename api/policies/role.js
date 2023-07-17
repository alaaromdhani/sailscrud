const UnkownError = require("../../utils/errors/UnknownError")

module.exports = (req,res,next)=>{
    console.log(Object.keys(req.session.cookie))
    
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