const  sequelize  = require("sequelize")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const fs = require('fs')
const path = require("path")
const  Cheerio  = require("cheerio")
const databaseCredentials = require("../../utils/constants")
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
         },
         createCustomStatement:(object,agent,courseId)=>{
           return  CustomObject.findOrCreate({
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
         },
         /**
          * 
          * @param {*} req:object 
          */
        handleXapiStatement:(req)=>{
         const body = req.body   
                try{

                    let verbId  = body.verb.id
                    let verbName = body.verb.display['en-US']
                    const object =body.object
                    let courseId =object.id.split('/')[0]
                    let name =  object.id.split('/').slice(1).join('/')
                    
                    if(name && name.endsWith('QS/QS')){
                        return sails.services.lrsservice.saveProgress(req.user,object,courseId)
                    }else if(name ==='TOTAL_SCORE'){
                        return sails.services.lrsservice.saveScore(req.user,object,courseId)
                    }
                    else if (name &&(name.endsWith('QS/NA') || name.endsWith('QS/TA') || name.endsWith('/RESULTS')) ){
                       
                        return Agent.findOne({where:{
                            user_id:req.user.id
                        }}).then(agent=>{
                            return sails.services.lrsservice.createCustomStatement(object,agent.dataValues,courseId)
                        })
                    }
                    else{
                        return {}
                    }
                }catch(e){
                    
                    return Promise.reject(e)
                }
             
         
        },
        saveScore:(user,object,courseId)=>{
            let course
            let agent
            return CoursInteractive.findByPk(courseId,{
                include:{
                    model:Course,
                    foreignKey:'parent',
                    attributes:['id','matiere_id'],
                    include:{
                        model:Module,
                        attributes:['id'],
                        foreignKey:'module_id',
                        include:{
                            model:Trimestre,
                            through:'trimestres_modules',
                            attributes:['id']
                        }
                    }
                }
            }).then(c=>{
                course =c
                if(course){
                    return ActivityState.findOne({
                        attributes:['id','c_interactive_id'],
                        where:{
                        
                        c_interactive_id:c.id,
                        deprecated:false,


                    },include:{
                        model:Agent,
                        where:{
                            user_id:user.id
                        },
                        required:true
                    }})
                }
                else{
                    return   Promise.reject(new RecordNotFoundErr())
                }
                /*
      SELECT (case when name like '%/TA' then replace(name,'/TA','') else replace(name,'/NA','') end ) as question ,sum( case when name like '%/NA' then ((5-cast(description as SIGNED)) +1) else 0 end ) as nb_diamonds,sum( case when name like '%/NA' then -cast(description as SIGNED) else cast(description as SIGNED) end ) FROM custom_objects where agent_id =1 and c_interactive_id ='urn:articulate:storyline:6kSQdksdvsdgvvs' and (name like '%/TA' or name like "%/NA") group by (case when name like '%/TA' then replace(name,'/TA','') else replace(name,'/NA','') end )
*/ 
            }).then(as=>{
                if(as){
                    agent = as.dataValues.Agent.dataValues
                    return CustomObject.findAll(
                        {
                        attributes:[
                            [sequelize.literal(`(case when name like '%/TA' then replace(name,'/TA','') else replace(name,'/NA','') end )`),'question'],
                            [sequelize.literal(`sum( case when name like '%/NA' then ((5-cast(description as SIGNED)) +1) else 0 end )`),'nb_diamonds'],
                            [sequelize.literal(`sum( case when name like '%/NA' then -cast(description as SIGNED) else cast(description as SIGNED) end )`),'diff']
                            
                        ],    
                        where:{

                            [sequelize.Op.and]:[
                                {c_interactive_id:as.dataValues.c_interactive_id},
                                {agent_id:as.dataValues.Agent.dataValues.id},
                                {name:{[sequelize.Op.or]:[{[sequelize.Op.like]:'%/TA'},{[sequelize.Op.like]:'%/NA'}]}}
                            ],


                        },
                        group:sequelize.literal(`(case when name like '%/TA' then replace(name,'/TA','') else replace(name,'/NA','') end )`)
                    })
                }
                else{
                    return Promise.reject(new RecordNotFoundErr())
                }

            }).then(c=>{
                    let nb_diamonds = c.reduce((prev,curr)=>{
                    if(curr.dataValues.diff<0){
                        return prev+1
                    }
                    else{
                        return prev+parseInt(curr.dataValues.nb_diamonds)
                    }

                },0)
                
                return  StudentScore.findOne({where:{
                    user_id:user.id,  
                    niveau_scolaire_id:user.AnneeNiveauUsers[0].niveau_scolaire_id,
                    annee_scolaire_id:user.AnneeNiveauUsers[0].annee_scolaire_id,
                    matiere_id:course.Course.matiere_id,
                    c_interactive_id:course.id   
                  }}).then(score=>{
                    
                    return sails.services.configservice.getCurrentTrimestres().then(currentTrimestre=>{
                        if(score){
                            let updated = {currentScore:nb_diamonds}
                            if(course.Course.type=='cours'){
                                if(course.Course.Module.Trimestres.map(i=>i.id).includes(currentTrimestre.id)){
                                    updated.trimestre_id = currentTrimestre.id
                                }
                            }else{
                                if(course.trimestre_id ===currentTrimestre.id){
                                    created.trimestre_id = currentTrimestre.id
                                }
                            }
                            console.log('updated',updated)
                            return score.update(updated)
                        }
                        else{
                            let created = {
                                niveau_scolaire_id:user.AnneeNiveauUsers[0].niveau_scolaire_id,
                                annee_scolaire_id:user.AnneeNiveauUsers[0].annee_scolaire_id,
                                matiere_id:course.Course.matiere_id,
                                c_interactive_id:course.id,
                                currentScore:nb_diamonds,
                                user_id:user.id,
                                totalScore:(5*course.nbQuestion)  
                            }
                            if(course.Course.type=='cours'){
                                if(course.Course.Module.Trimestres.map(i=>i.id).includes(currentTrimestre.id)){
                                    created.trimestre_id = currentTrimestre.id
                                }
                            }else{
                                if(course.trimestre_id ===currentTrimestre.id){
                                    created.trimestre_id = currentTrimestre.id
                                }
                            }
                            return StudentScore.create(created)
             
                        }
                    })
                  }) 
            }).then(data=>{
               return sails.services.lrsservice.createCustomStatement(object,agent,course.id).then(([m,created])=>{
                  if(!created){
                    return m.update({description:object.definition.name['en-US']})
                  } 
                })
            })
            
        }
        ,
         saveProgress:(user,object,courseId)=>{
            let agent
            return ActivityState.findOne(
                {
                where:{
                    deprecated:false,
                    c_interactive_id:courseId,
                },
                include:{
                    model:Agent,
                    where:{
                        user_id:user.id
                    },
                    required:true
                },
            }).then(as=>{
               let name =  object.id.split('/').slice(1).join('/')
                if(as ){
                    agent = as.Agent.dataValues
                    let progress = parseInt(name.replace('QS/QS',''))
                    if(as.dataValues.progression){
                        if(progress>=as.dataValues.progression){
                            as.progression = progress
                            return as.save()
                        }
                        else{
                            return Promise.reject(new ValidationError())
                        }
                    }
                    else{
                        as.progression = progress
                        return as.save()
                    }
                }
                else{
                    return Promise.reject(new RecordNotFoundErr())
                }
            }).then(data=>{
                return sails.services.lrsservice.createCustomStatement(object,agent,courseId)
            })

         },
         addScript:(url,type)=>{
            try{
                let p 
            if(type==='course'){
                p ='../../static/courses/'+url+'/index_lms.html' 
            }            
            if(type==='softskills'){
                p ='../../static/softskills'+url+'/index_lms.html'
            }
            if(type==='others'){
                p ='../../static/other/'+url+'/index_lms.html'
            }
            
            var html = fs.readFileSync(path.join(__dirname,p), 'utf8');
            var $ = Cheerio.load(html);
            
            var scriptNode = `<script src="${sails.config.custom.baseUrl}js/oneTimeScript.js">
           
          </script>`;
          $('body').append(scriptNode);
             return new Promise((resolve,reject)=>{
                fs.writeFile(path.join(__dirname,p),$.html(),(err,data)=>{
                    if(!err){
                      return resolve()                    
                    }
                    else{
                        return reject(err)
                    }
                  })

             })
 
            }catch(e){
                return Promise.reject(e)
            }          
         }
         
}