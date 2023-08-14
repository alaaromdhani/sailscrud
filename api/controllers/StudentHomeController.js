const { countBy } = require("lodash")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const getCurrentTrimestre = require("../../utils/getCurrentTrimestre")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    getMatieres:async (req,res)=>{
        //console.log("niveau_scolaire :",req.user.niveau_scolaire_id)
       const data = await NiveauScolaire.findByPk(req.user.niveau_scolaire_id,{
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
        const TrimestreId = req.query.TrimestreId
        
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
                  NiveauScolaireId:req.user.niveau_scolaire_id
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
                return DataHandlor(req,{modules:metiere_niveau.Modules,matiere:metiere_niveau.Matiere},res)  
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
        
        const course = await Course.findByPk(courseId,{
            attributes:['id','niveau_scolaire_id','active'],
            include:[{
                model:CoursInteractive,
                
                foreignkey:'parent',
                attributes:['name','description','thumbnail','rating'],
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            },
            {
               attributes:['name','description','source','rating'],
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
                attributes:['name','description','rating'],
        
                where:{
                   validity:true,
                   active:true 
                },
                required:false
            }],

        })
        //console.log(course)
        if(!course || course.niveau_scolaire_id!=req.user.niveau_scolaire_id || !course.active){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            return DataHandlor(req,{CoursDocuments:course.CoursDocuments,CoursVideos:course.CoursVideos,CoursInteractives:course.CoursInteractives},res)
        }


    }



}