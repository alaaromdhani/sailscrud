const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const SqlError = require("../../utils/errors/sqlErrors")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
    
    if(req.role.name === sails.config.custom.roles.student.name){
        if(!req.user.AnneeNiveauUsers || !req.user.AnneeNiveauUsers.length){
            sails.services.userservice.logout(req,(err,data)=>{
                if(err){
                  return ErrorHandlor(req,err,res)
                 }  
                 else{
                    return ErrorHandlor(req,new SqlError({message:'لا يُنسب هذا المستخدم إلى عام دراسي ساري'}),res)
                }
            })
        }
        else{
            req.current_niveau_scolaire = req.user.AnneeNiveauUsers[0].niveau_scolaire_id
            return next()
        }
       
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