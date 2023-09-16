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
        let timestamp = req.body.timestamp
        let statementId = req.body.id 
       let agentName = req.body.actor.name
       let verbId = req.body.verb.id
       let verbName = req.body.verb.display['en-US']
       let objectId = req.body.object.id
       


       if(timestamp && statementId && agentName && verbId && verbName && objectId){
            let custom_object
            let created  
            const object =req.body.object 
            const courseId =object.id.split('/')[0]
            const c = await CoursInteractive.findByPk(courseId)
            if(!c){
                return ErrorHandlor(req,new RecordNotFoundErr(),res)
            }
            else{
                    if(!c.tracked){
                        return DataHandlor(req,{},res)
                    }
            }
        const agent = await Agent.findOne({where:{account_name:agentName}})
        let activityState = await ActivityState.findOne({where:{agent_id:agent.id,c_interactive_id:courseId,deprecated:false}})
            if(!activityState){
                //i case the the results has been resetted so he has to repeat the course  
                return ErrorHandlor(req,new UnauthorizedError({specific:'this course has been resetted so all statement will be depercated'}),res)
            }
            
            const obj = await Obj.findOne({where:{id:objectId}})// the 
            if(!obj){
                try{
                    await sails.services.subcourseservice.saveProgress(activityState,object);
             
                }catch(e){
                    console.log(e)
                    return ErrorHandlor(req,resolveError(e),res)
                }
                [custom_object,created] = await CustomObject.findOrCreate({
                    where:{
                        agent_id:agent.id,
                        c_interactive_id:courseId,
                        und:object.id
                    },
                    defaults:{
                        und:object.id,
                        type:object.objectType,
                        name:object.id.replace(courseId+'/',''),
                        description:object.definition.name['en-US'],
                        c_interactive_id:object.id.split('/')[0],
                        agent_id:agent.id
                    }
                })

                if(!created && object.definition.name['en-US']!==custom_object.description){
                    custom_object.description = object.definition.name['en-US']
                      await custom_object.save()  
                }
            }
            if((agent && obj) || (agent && custom_object)){
                try{
                    const verb = await Verb.findOrCreate({where:{id:verbId},defaults:{id:verbId,display:verbName}})
                    if(custom_object){
                        await Statement.create({
                            id:statementId,
                            jsonData:req.body,
                            custom_object_id:custom_object.id,
                            c_interactive_id: courseId,
                            verb_id:verbId,
                            timeStamp:timestamp,
                            agent_id:agent.id
                            
    
                        })
                    }
                    else{
                        await Statement.create({
                            id:statementId,
                            jsonData:req.body,
                            obj_id:obj.id,
                            c_interactive_id: obj.c_interactive_id,
                            verb_id:verbId,
                            timeStamp:timestamp,
                            agent_id:agent.id
                            
    
                        })
                    }

                        
                }
                catch(e){
                    console.log(e)
                    return ErrorHandlor(req,new SqlError(e),res)
                }
            }
            else{
                    return ErrorHandlor(req,new UnkownError(),res)

            }
     }
       else {
             return ErrorHandlor(req,new ValidationError(),res)   
       }
        
    
       return res.status(200).json({data:{mess:'object is created successfully'}})
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