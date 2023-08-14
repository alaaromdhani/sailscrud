const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    getMatieres:async (req,res)=>{
        //console.log("niveau_scolaire :",req.user.niveau_scolaire_id)
       const data = await NiveauScolaire.findByPk(req.user.niveau_scolaire_id,{
            include:{
                model:Matiere,
                through:MatiereNiveau,
                attributes:['name','color'],
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
        const TrimestreId = req.query
        let includeOptions = [{
            model:Course,
            foreignkey:'module_id',
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
            }

          })  
        }
        try{
            let metiere_niveau = await MatiereNiveau.findOne({
                where:{
                  MatiereId,
                  NiveauScolaireId:req.user.niveau_scolaire_id
                },
                include:  {
                  model:Module,
                  foreignkey:'matiere_niveau_id',
                  include:includeOptions,
                  
                  
                }
           })
           if(metiere_niveau){
                return DataHandlor(req,metiere_niveau.Modules,res)  
           }
           else{
              return DataHandlor(req,[],res) 
          }
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }   



    },
    getChildren:(req,res)=>{
        



    }



}