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
        return sails.services.teacherhomeservice.courses.getPurchase(req)
        .then(data=>{
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
                            attributes:['agent_id','progression'],
                            include:{
                                model:Agent,
                                attributes:['user_id'],
                                foreignKey:'agent_id',
                                where:{
                                    user_id: data.dataValues.user_id
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
             }]

            })
       
        })   
        }
}