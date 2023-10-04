const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const UnkownError = require("../../utils/errors/UnknownError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = {
    getActivityState:async (req,res)=>{

        const {agent,activityId} = req.query
      // console.log(agent)
        let dbAgent = await Agent.findOne({where:{account_name:JSON.parse(agent).name}})
        let activity = await CoursInteractive.findOne({where:{id:activityId}})
        //console.log('agent',dbAgent)
        //console.log('activity',activity) 
       
        if(dbAgent&&activity){
                    let activityState = await ActivityState.findOne({where:{agent_id:dbAgent.id,c_interactive_id:activity.id,deprecated:false}})
                     if(!activityState){
                        const data = 'ActivityState('+activityId+'|'+agent+': resume'
                        try{
                            const actState = await ActivityState.create({
                                c_interactive_id:activity.id,
                                agent_id:dbAgent.id,
                                etag:Math.random().toString(36).substr(2, 9),
                                state:data    
                            })
                            res.send(data)

                        }
                        catch(e){
                            console.log(e)
                           ErrorHandlor(req,new SqlError(e),res)     
                           // responseHandler(res,response.internalServerError({message:translateReponseMessage(req,{unchanged:'some error accured while doing this process'})}))
                        }
                    }
                     else{
                        res.set('Content-Type', 'application/octet-stream');
                        res.write(Buffer.from(activityState.state));
                        res.end()

                     }

            }
            else{
                    return ErrorHandlor(req,new ValidationError({message:'activity and agent are required'}),res)
            }
            





    },
    putState:async (req,res)=>{
         const {agent,activityId} = req.query
         let dbAgent = await Agent.findOne({where:{account_name:JSON.parse(agent).name}})
       let activity = await CoursInteractive.findOne({where:{id:activityId}})
        if(dbAgent && activity){
            try{
                console.log(req.body)
                const activityState = await ActivityState.findOne({
                    where:{
                        c_interactive_id:activityId,
                        agent_id:dbAgent.id,
                        deprecated:false                        
                    }
                })
                if(activityState){
                    await activityState.update({state:req.body})
                    return DataHandlor(req,{},res)
                }
                else{
                    return ErrorHandlor(req,new RecordNotFoundErr(),res)
                }
            }
            catch(e){
                   return ErrorHandlor(req,new SqlError(e),res) 
            }
        }
        else{
                return ErrorHandlor(req,new ValidationError({message:'agent and activity are required'}),res)
        }
    },
    
    
    putStatement:async (req,res)=>{
       try{
        return DataHandlor(req,await sails.services.lrsservice.handleXapiStatement(req),res)
       }catch(e){
        console.log(e)
        return ErrorHandlor(req,resolveError(e),res)
       }

    },
    getStatements:async (req,res)=>{
        const courseId = req.query.courseId
        if(courseId){
            const agent = await Agent.findOne({where:{
                  user_id:req.user.id  

            },include:{
                model:Statement,
                where:{c_interactive_id:courseId},
                foreignKey:'agent_id',
                include:[{
                    model:Obj,
                    foreignKey:'obj_id'
                },{
                    model:Verb,
                    foreignKey:'verb_id'
                }]
            }})
            if(agent && agent.Statements){
                return DataHandlor(req,agent,res)
            }
            else{
                return ErrorHandlor(req,new RecordNotFoundErr(),res)    
            }
        }
        else{
            responseHandler(res,response.badRequest({message:'missing parameter courseId'}))
        }
    },



}