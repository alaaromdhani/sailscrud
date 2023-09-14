const { countBy } = require("lodash")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const getCurrentTrimestre = require("../../utils/getCurrentTrimestre")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")

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
        const {MatiereId} = req.params 
        const TrimestreId = req.query.TrimestreId || (await sails.services.configservice.getCurrentTrimestres()).id
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
        const  {courseId} = req.params
        let course =  await Course.findOne({
            where:{
                id:courseId,
                niveau_scolaire_id:req.current_niveau_scolaire,
                active:true
            },
            attributes:['id','niveau_scolaire_id','active'],
           include:[{
            model:Module,
            
            foreignkey:'module_id',
            include:{
                  model:Trimestre,
                  through:'trimestres_modules',
                   attributes:['id'] 
            }
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
              attributes:['id','name','description','thumbnail','rating','status'],
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
       
               where:{
                  validity:true,
                  active:true 
               },
               required:false
           }]

        }) 
        let canAccessPrivate = course.dataValues.Module.dataValues.Trimestres.map(t=>t.dataValues.id).some(t=>req.user.AnneeNiveauUsers.filter(a=>a.type==='paid').map(a=>a.trimestre_id).includes(t))
        if(!course){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            return DataHandlor(req,{CoursDocuments:course.CoursDocuments,CoursVideos:course.CoursVideos,CoursInteractives:course.CoursInteractives,canAccessPrivate},res)

        }       
          

    }



}