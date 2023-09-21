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
                    attributes:['id','name','rating','description'],
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
    



}