const SqlError = require("../../utils/errors/sqlErrors")

module.exports={
        generateAgent:async (user,callback)=>{
            try{
               
                let [agent,created]  = await Agent.findOrCreate({where:{user_id:user.id},defaults:{
                    mbox:user.email,account_homepage:sails.config.custom.baseUrl,account_name:user.username,user_id:user.id
                }})
                callback(null,agent)
            }
            catch(e){
                console.log(e)
                callback(new SqlError(e),null)    
            }
         }
}