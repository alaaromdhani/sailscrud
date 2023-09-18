const { countBy } = require("lodash")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const getCurrentTrimestre = require("../../utils/getCurrentTrimestre")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")
const { Sequelize,Op } = require("sequelize")
const resolveError = require("../../utils/errors/resolveError")
const sequelize = require('sequelize')
module.exports={
    profileCallback:(req,res)=>{
        return DataHandlor(req,req.user,res)

    },
    getMatieres:async (req,res)=>{
        //console.log("niveau_scolaire :",req.current_niveau_scolaire)
            let data = await  MatiereNiveau.findAll({where:{
                NiveauScolaireId:req.current_niveau_scolaire,
            },    
            group:'MatiereId',     
            attributes:[[sequelize.fn('sum',sequelize.col('Courses->CoursInteractives`.`nbQuestion')),'sumNbQuestion'],[sequelize.fn('sum',sequelize.col(`Courses->CoursInteractives->ActivityStates.progression`)),'sumProgression']],
            include:[{
                model:Matiere,
                foreignKey:'MatiereId',
                attributes:['name','id','color','description'],
                include:{
                    model:Upload,
                    foreignKey:'image',
                    attributes:['link']
                }
            },{
                model:Course,
                foreignKey:'matiere_niveau_id',
                attributes:['id'],
                include:{
                    model:CoursInteractive,
                    foreignKey:'parent',
                    attributes:[[sequelize.col('nbQuestion'),'nb']],
                    include:{
                        model:ActivityState,
                        foreignKey:'c_interactive_id',
                        required:false,
                        include:{
                            model:Agent,
                            foreignKey:'agent_id',
                            where:{
                                user_id:req.user.id
                            },
                            required:true,
                            
                        },
                        attributes:['agent_id','progression']

                    }

                }
            }]
        
            })
            return DataHandlor(req,data.map(d=>{ return {matiere:d.Matiere,total:(d.dataValues.sumNbQuestion!=='null'?d.dataValues.sumNbQuestion:0),attempted:(d.dataValues.sumProgression!=='null'?d.dataValues.sumProgression:0)}}),res)
        
        

    },
    getCourses:async(req,res)=>{
        //const trimestre_id
        const {MatiereId,TrimestreId} = req.params 
        let ann = req.user.AnneeNiveauUsers.filter(a=>a.trimestre_id===TrimestreId).at(0)
        let canAccessPrivate =false
        if(ann && ann.type=='paid'){
        canAccessPrivate =true      
        }
      
        let includeOptions = [{
            model:Course,
            foreignkey:'module_id',
            attributes:['id','name','rating','description'],
            where:{
                active:true

            },
            
            required:false
        }]
        if(TrimestreId){
          includeOptions.push({
            model:Trimestre,
            through:'trimestres_modules',
            where:{
                id:TrimestreId    
            },
            attributes:[],

          })  
        }
        try{
            let metiere_niveau = await MatiereNiveau.findOne({
                where:{
                  MatiereId,
                  NiveauScolaireId:req.current_niveau_scolaire
                },
                include:  [{
                  model:Module,
                  foreignkey:'matiere_niveau_id',
                  include:includeOptions,
                 required:false
                  
                },{
                    model:Matiere,
                    foreignkey:'MatiereId'

                }],
                
           })

           if(metiere_niveau){
                return DataHandlor(req,{modules:metiere_niveau.Modules,matiere:metiere_niveau.Matiere,canAccessPrivate},res)  
           }
           else{
              return DataHandlor(req,[],res) 
          }
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,new SqlError(e),res)
        }   



    },
    getChildren:async (req,res)=>{
        try{
            const  {courseId,TrimestreId} = req.params
        let course =  await Course.findOne({
            where:{
                id:courseId,
                niveau_scolaire_id:req.current_niveau_scolaire,
                active:true
            },
            attributes:['id','niveau_scolaire_id','active','name'],
           include:[{
            model:Module,
            required:true,
            foreignkey:'module_id',
            include:{
                  model:Trimestre,
                  through:'trimestres_modules',
                   attributes:['id'] ,
                   where:{
                    id:TrimestreId
                    },
                    required:true
            },

            },{
               model:CoursInteractive,
               
               foreignkey:'parent',
               attributes:['id','name','description','thumbnail','rating','status'],
               where:{
                  validity:true,
                  active:true 
               },
               include:{
                        
                model:ActivityState,
                foreignKey:'c_interactive_id',
                attributes:['agent_id','progression'],
                    include:{
                        model:Agent,
                        attributes:['user_id'],
                        foreignKey:'agent_id',
                        where:{
                        user_id: req.user.id
                        },
                        required:true
                    },
                    required:false

                },
               required:false,
           },
           {
              attributes:['id','name','description','rating','status'],
                model:CoursVideo,
               foreignkey:'parent',
               where:{
                  validity:true,
                  active:true 
               },
               required:false
           },
           {
               model:CoursDocument,
               foreignkey:'parent',
               attributes:['id','name','description','rating','status'],
               include:{
                model:Upload,
                foreignkey:'document',
                attributes:['link']
               }, 
               where:{
                  validity:true,
                  active:true 
               },
               required:false
           }]

        }) 
         if(!course){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            let canAccessPrivate = course.dataValues.Module.dataValues.Trimestres.map(t=>t.dataValues.id).some(t=>req.user.AnneeNiveauUsers.filter(a=>a.type==='paid').map(a=>a.trimestre_id).includes(t))
       
            return DataHandlor(req,{course,canAccessPrivate},res)

        }       
 
        }         

        catch(e){
            console.log(e)
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
    availableTrimestres:async (req,res)=>{
        try{
            let data = await AnneeNiveauUser.findAll({where:{
                id:{
                    [Op.in]:req.user.AnneeNiveauUsers.map(a=>a.id)
                }
            },
            include:[{
                model:Trimestre,
                foreignkey:'trimestre_id',
                attributes:['id','name_ar']
            },{
                model:AnneeScolaire,
                foreignkey:'annee_scolaire_id',
                attributes:['startingYear','endingYear']
            },
            {
                model:NiveauScolaire,
                foreignkey:'niveau_scolaire_id',
                attributes:['name_ar']
            }
        ]
            
        })
            return DataHandlor(req,data,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }


    },
    
   
    canAccessSoftSckills:(req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        return DataHandlor(req,{canAccessSoftSckills:nbPaidTrimstres.length>=2},res)


    },
    getsoftSkillsThemes:async (req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>=2){
           try{
            return DataHandlor(req,
                await SoftSkills.findAll(
                    {
                        group:'theme_id',
                        include:[{
    
                            model:NiveauScolaire,
                            through:'soft_skills_ns',
                            attributes:['id'],
                            where:{
                                id:req.current_niveau_scolaire
                            }
                        },
                        {
                            model:SoftSkillsTheme,
                            foreignKey:'theme_id',
                        }]
    
                        ,
                        attributes:['id']
    
    
    
                    })
                ,res
               )
           }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
           }
        }
        else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }

    },
    getSoftSkills:async (req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>=2){
          try{
            const {theme_id} = req.params
            let data = await SoftSkills.findAll({
                where:{
                    theme_id
                },
                attributes:['name','description','rating'],
          
                include:[{
                    model:NiveauScolaire,
                    where:{
                        id:req.current_niveau_scolaire,
                    },
                    through:'soft_skills_ns',
                    required:true,
                    attributes:['id']
                },]
            })
            return DataHandlor(req,data,res)
          
          }catch(e){
            console.log(e)
            return ErrorHandlor(req,new SqlError(e),res)
          }      
        }
        else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        
    },
   
    getsoftSkillsChildren:async (req,res)=>{

        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>=2){
            
           try{
            let data = await SoftSkills.findOne({
                where:{
                    id:req.params.id
                },
                attributes:['name','description','rating'],
          
                include:[{
                    model:NiveauScolaire,
                    where:{
                        id:req.current_niveau_scolaire,
                    },
                    through:'soft_skills_ns',
                    required:true,
                    attributes:['id']
                },
                    {
                        model:SoftSkillsVideo,
                        foreignKey:'parent',
                        attributes:['id','name','description','rating','source','url']    
                        
                    },
                    {
                        model:SoftSkillsDocument,
                        foreignKey:'parent',
                        attributes:['id','name','description','rating'],
                        include:{
                            model:Upload,
                            foreignKey:'document',
                            attributes:['link']
                        }    
                    },
                    {
                        model:SoftSkillsInteractive,
                        foreignKey:'parent',
                        attributes:['id','name','description','thumbnail','rating','status'],
                  
                    }
                ]
            })
            return  DataHandlor(req,data,res)
           }catch(e){
           
            return ErrorHandlor(req,new SqlError(e),res)
           }
        }
            
        else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }

    },
    accessSoftSkills:(req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>2){
             
        
            SoftSkillsInteractive.findOne({where:{
              id:req.params.id,validity:true,active:true,include:{
                model:NiveauScolaire,
                through:'soft_skills_ns',
                attributes:['id'],
                where:{
                   id:req.current_niveau_scolaire 
                }
              }
              
            }}).then(ci=>{
              if(!ci){
                  return ErrorHandlor(req,new RecordNotFoundErr(),res)
              }
              else{
                  sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                            if(err){
                                  return ErrorHandlor(req,err,res)
                            }
                            else{
                            
                              //console.log(ci.url)
                              let fullUrl =  sails.config.custom.baseUrl+'softskills/'+ci.url+"/"+'index_lms.html'
                              return res.view("pages/player.ejs",{
                                    url:fullUrl,
                                    username:req.user.firstName +' '+req.user.firstName,
                                    sex:req.user.sex.toLowerCase()
                              })
                            }
        
        
                  })
              }
            }).catch(e=>{
        
                 ErrorHandlor(req,new RecordNotFoundErr(),res)
            })  
        
        
        
          }else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
          }
        
        },
        
        getExams:async (req,res)=>{
           const {TrimestreId,MatiereId} = req.params
            try{
                let data = await Course.findAll({where:{
                    trimestre_id:TrimestreId,
                    matiere_id:MatiereId,

                    type:'exam',
                    niveau_scolaire_id:req.current_niveau_scolaire,
                   
                },
                include:{
                    model:Matiere,
                    foreignKey:'matiere_id',
                    attributes:['name']
                }
            }) 
                return DataHandlor(req,data,res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }

        },
        getExamsChildren:async (req,res)=>{
        const {courseId,TrimestreId} = req.params 
        let ann = req.user.AnneeNiveauUsers.filter(a=>a.dataValues.trimestre_id===parseInt(TrimestreId)).at(0)
        //console.log(req.user.AnneeNiveauUsers)
        let canAccessPrivate =(ann && ann.type=='paid')?true:false
        //console.log("canAccessPrivate",canAccessPrivate)
    
   
        try{
            let data = await Course.findOne({where:{
                trimestre_id:TrimestreId,
                id:courseId,
                type:'exam',
                niveau_scolaire_id:req.current_niveau_scolaire,
                active:true
            },include:[{
                model:CoursInteractive,
                
                foreignkey:'parent',
                attributes:['id','name','description','thumbnail','rating','status'],
                where:{
                   validity:true,
                   active:true 
                },
                include:{
                        
                    model:ActivityState,
                    foreignKey:'c_interactive_id',
                    attributes:['agent_id','progression'],
                    include:{
                            model:Agent,
                            attributes:['user_id'],
                            foreignKey:'agent_id',
                            where:{
                            user_id: req.user.id
                            },
                            required:true
                          },
                        required:false

                    }, 
                required:false
            },
            {
               attributes:['id','name','description','rating','status'],
                 model:CoursVideo,
                foreignkey:'parent',
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            },
            {
                model:CoursDocument,
                foreignkey:'parent',
                attributes:['id','name','description','rating','status'],
                include:{
                 model:Upload,
                 foreignkey:'document',
                 attributes:['link']
                }, 
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            }]})
            if(!data){
                throw new RecordNotFoundErr()
            }
            return DataHandlor(req,{"course":data,canAccessPrivate},res)
        }catch(e){
 
            return ErrorHandlor(req,resolveError(e),res)
        }

        },
        accessCourse:async(req,res)=>{
                try{
                    let ci = await sails.services.subcourseservice.accessCourse(req)
                      
                    sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                                if(err){
                                    return ErrorHandlor(req,new SqlError(err),res)
                                }
                                else{
                                const tincanActor = JSON.stringify({
                                    name: agent.account_name,
                                    account:[{accountName:agent.mbox,accountServiceHomePage:agent.account_name}],
                                    objectType:'Agent'
                                })
                                let endpoint = sails.config.custom.lrsEndPoint
                                
                                let fullUrl =  sails.config.custom.baseUrl+'courses/'+ci.url+"/"+'index_lms.html?actor='+tincanActor+"&endpoint="+endpoint
                                return res.view("pages/player.ejs",{
                                    ci:ci,
                                    url:fullUrl,
                                    username:req.user.firstName+' '+req.user.lastName,
                                    sex:req.user.sex.toLowerCase()
                                    })
                                }
        
        
                    })
                } catch(e){
                    console.log(e)
                    return ErrorHandlor(req,resolveError(e),res)
                }      
            
    
        },
        
       



}