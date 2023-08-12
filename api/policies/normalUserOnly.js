const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")

module.exports = (req,res,next)=>{
           
        const {roles} = sails.config.custom

        const test = Object.keys(roles).filter(k=>roles[k].name===req.role.name).map(k=>roles[k]).at(0)
    
            
          if(!test ||test.dashboardUser){
            sails.services.userservice.logout(req,(err,data)=>{
              if(err){
                return ErrorHandlor(req,err,res)
               }  
               else{
                return ErrorHandlor(req,new UnauthorizedError(),res)
               }
             })
          }
          else{
            return next()
          }


}