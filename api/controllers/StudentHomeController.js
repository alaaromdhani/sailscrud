const { countBy } = require("lodash")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const getCurrentTrimestre = require("../../utils/getCurrentTrimestre")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")
const { Sequelize,Op } = require("sequelize")

module.exports={
    profileCallback:(req,res)=>{
        return DataHandlor(req,req.user,res)

    },
    getMatieres:async (req,res)=>{
        //console.log("niveau_scolaire :",req.current_niveau_scolaire)
       const data = await NiveauScolaire.findByPk(req.current_niveau_scolaire,{
            include:{
                model:Matiere,
                through:MatiereNiveau,
                attributes:['id','name','color','description'],
                include:{
                    model:Upload,
                    foreignkey:'image',
                    attributes:['link']
                },
                where:{
                    active:true
                },
                required:false
            }

        })
        if(!data){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            return DataHandlor(req,data.Matieres,res)
        }



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
    
    accessCourse:(req,res)=>{
        console.log('thiis the page where i am')
        let where={id:req.params.courseId,active:true,validity:true} 
            
            CoursInteractive.findOne({
                where,
                include:{
                    model:Course,
                    foreignKey:'parent',
                    attributes:['niveau_scolaire_id'],
                    include:{
                        model:Module,
                        foreignKey:'module_id',
                        attributes:['id'],
                        include:{
                            model:Trimestre,
                            through:'trimestres_modules',
                            attributes:['id']
                        }
                    }
                }
            
            }).then(ci=>{
              //  console.log(c)
                    if(!ci){
                        return Promise.reject(new RecordNotFoundErr())
                    }
                    else{
                        const courseNs = ci.dataValues.Course.dataValues.niveau_scolaire_id
                   // const trimestres =ci.dataValues.Course.dataValues.Module.dataValues.Trimestres.map(t=>t.dataValues.id) 
                     if(req.current_niveau_scolaire===courseNs){
                        if(ci.dataValues.status==='public'){
                            return ci
                        }
                        else{
                            const trimestres =ci.dataValues.Course.dataValues.Module.dataValues.Trimestres.map(t=>t.dataValues.id) 
                            
                            return trimestres.some(t=>req.user.AnneeNiveauUsers.filter(a=>a.type==='paid').map(a=>a.trimestre_id).includes(t))?ci:Promise.reject(new RecordNotFoundErr())
                        }
                     }
                     else{
                        return Promise.reject(new RecordNotFoundErr())  
                     }
                    }
            }).then(ci=>{
                console.log(ci)
              
                if(!ci){
                    return ErrorHandlor(req,new RecordNotFoundErr(),res)
                }
                else{
                    sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                              if(err){
                                    return 
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
                }    
            }).catch(e=>{
                console.log(e)
                return ErrorHandlor(req,e,res)
            })      
               


    },
    canAccessSoftSckills:(req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        return DataHandlor(req,{canAccessSoftSckills:nbPaidTrimstres.length>=2},res)


    },
    getsoftSkillsThemes:async (req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>=2){
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
        }
        else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }

    },
   
    getsoftSkillsChildren:async (req,res)=>{
        const nbPaidTrimstres = req.user.AnneeNiveauUsers.filter(an=>an.dataValues.type==='paid')
        if(nbPaidTrimstres.length>=2){
            
           try{
            let data = await SoftSkills.findAll({
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
            console.log(e)
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
        
       



}