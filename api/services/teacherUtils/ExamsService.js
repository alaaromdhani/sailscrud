const RecordNotFoundErr = require("../../../utils/errors/recordNotFound")

module.exports={
    getExams:async (req,res)=>{

            const {id,MatiereId} = req.params
           return sails.services.teacherhomeservice.courses.getPurchase(req)
           .then(data=>{
            return Course.findAll({where:{
                trimestre_id:data.dataValues.trimestre_id,
                type:'exam',
                matiere_id:MatiereId,
                niveau_scolaire_id:data.dataValues.niveau_scolaire_id,
                active:true,
               
               
            },
            include:{
                model:Matiere,
                foreignKey:'matiere_id',
                attributes:['name']
            },
            attributes:['id','name','description','rating']})
 

           })
       },
       getExamsChildren:(req)=>{
        let canAccessPrivate 
        return sails.services.teacherhomeservice.courses.getPurchase(req)
        .then(data=>{
            canAccessPrivate = (data.dataValues.type==='paid')
        return Course.findOne({where:{
            id:req.params.courseId,
            trimestre_id:data.dataValues.trimestre_id,
            type:'exam',
            niveau_scolaire_id:data.dataValues.niveau_scolaire_id,
            active:true,
        
            },    
            attributes:['id','name','description','rating'],
                include:[{
                    model:CoursInteractive,
                    foreignKey:'parent',
                    attributes:['id','name','description','thumbnail','rating','status','nbQuestion'],
                    where:{
                        validity:true,
                        active:true 
                    },
                    include:{
                        
                            model:ActivityState,
                            foreignKey:'c_interactive_id',
                            attributes:['agent_id','progression','deprecated'],
                            include:{
                                model:Agent,
                                attributes:['user_id'],
                                foreignKey:'agent_id',
                                where:{
                                    user_id: req.user.id
                                },
                                required:true
                            },
                            where:{
                                deprecated:false
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
             }]

            })
       
        }).then(exams=>{
            return {exams,canAccessPrivate}
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
                where:{type:'exam',trimestre_id:purchase.dataValues.trimestre_id,niveau_scolaire_id:purchase.dataValues.niveau_scolaire_id},
                attributes:['niveau_scolaire_id'],
                
            }},).then(c=>{
            if(!c){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                return c
            }
        })

    },    
    accessExams:(req)=>{
        return sails.services.teacherhomeservice.courses.getPurchase(req).then(data=>{
            return sails.services.teacherhomeservice.exams.findCourseByPerchase(req.params.courseId,data)

        })

    }
}