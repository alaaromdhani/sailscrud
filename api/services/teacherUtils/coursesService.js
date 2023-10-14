const sequelize= require('sequelize')
const RecordNotFoundErr = require('../../../utils/errors/recordNotFound')
module.exports={
    getPurchase:(req)=>{
        return TeacherPurchase.findOne({where:{
            id:req.params.id,
            addedBy:req.user.id
        }}).then(p=>{
            if(!p){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return p
            }
        })
    },
    getMatieres:(req)=>{
        
        return sails.services.teacherhomeservice.courses.getPurchase(req).then(p=>{
          
           return  MatiereNiveau.findAll({where:{
                NiveauScolaireId:p.dataValues.niveau_scolaire_id,
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


        })  
      

    },
   
    getCourses:(req)=>{
        let canAccessPrivate
        let {MatiereId}=req.params
               
        return sails.services.teacherhomeservice.courses.getPurchase(req).then(data=>{
                canAccessPrivate=(data.dataValues.type==='paid')
                let ns = data.dataValues.niveau_scolaire_id
                let TrimestreId = data.dataValues.trimestre_id
                let includeOptions = [{
                    model:Course,
                    foreignkey:'module_id',
                    attributes:['id','name','rating','description','order'],
                    where:{
                        active:true,
                        type:'cours'
        
                    },
                    
                    required:false
                },{
                    model:Trimestre,
                    through:'trimestres_modules',
                    where:{
                        id: TrimestreId   
                    },
                    attributes:[],
                    
                    
        
                  }]
               
                return MatiereNiveau.findOne({
                    where:{
                      MatiereId,
                      NiveauScolaireId:ns
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
            }).then(data=>{
                if(!data){
                    return Matiere.findByPk(MatiereId).then(m=>{
                        return {matiere:m,modules:[],canAccessPrivate}

                    })
                }
                else{
                    return {matiere:data.Matiere,modules:data.dataValues.Modules,canAccessPrivate}
                }
            })
        
    },
    getCoursesChildren:(req)=>{
        let canAccessPrivate
        let {courseId} = req.params 
        return sails.services.teacherhomeservice.courses.getPurchase(req).then(data=>{
            canAccessPrivate=(data.dataValues.type==='paid')
            return Course.findOne({
                where:{
                    id:courseId,
                    type:'cours',
                    niveau_scolaire_id:data.dataValues.niveau_scolaire_id,
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
                        id:data.dataValues.trimestre_id
                        },
                        required:true
                },
    
                },{
                   model:CoursInteractive,
                   
                   foreignkey:'parent',
                   attributes:['id','name','description','thumbnail','rating','status','nbQuestion','order'],
                   where:{
                      validity:true,
                      active:true 
                   },
                     include:{
                        model:ActivityState,
                        foreignKey:'c_interactive_id',
                        attributes:['agent_id','progression','deprecated'],
                        where:{
                            deprecated:false
                        },
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
                attributes:['id','name','description','rating','status','url','source'],
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
             }
               ]
    
            })


        }).then(course=>{
            if(!course){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return {course,canAccessPrivate}
            }
        })
    },
    findCourseByPerchase:(courseId,purchase)=>{
        let where = {id:courseId}
        if(purchase.dataValues.type!=='paid'){
            where.status='public'
        }
        return CoursInteractive.findOne({where,
            include:{
                model:Course,
                where:{type:'cours'},
                attributes:['niveau_scolaire_id'],
                include:{
                    model:Module,
                    attributes:['id'],
                    include:{
                        model:Trimestre,
                        through:'trimestres_modules',
                        where:{
                            id:purchase.dataValues.trimestre_id
                        },
                        required:true
                    },
                    required:true
                }
            }},).then(c=>{
            if(!c || c.dataValues.Course.dataValues.niveau_scolaire_id!=purchase.dataValues.niveau_scolaire_id){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return c
            }
        })

    },
    accessCourse:(req)=>{
        return sails.services.teacherhomeservice.courses.getPurchase(req).then(data=>{
            return sails.services.teacherhomeservice.courses.findCourseByPerchase(req.params.courseId,data).then(c=>{
            
                if(!c.dataValues.addedScript){
                    return sails.services.lrsservice.addScript(c.dataValues.url,'course').then(()=>{
                        return c.update({addedScript:true})
                    })
                }else{
                    return c
                }
              }).then(c=>{
                return {
                      endpoint:sails.config.custom.baseUrl+'courses/'+c.dataValues.url+"/"+'index_lms.html',
                      username:req.user.firstName+' '+req.user.lastName, 
                      sex:req.user.sex  
                }
              })

        })


    },
    
   

    



}