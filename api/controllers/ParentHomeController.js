const { Op } = require("sequelize")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    getThemes:async (req,res)=>{
        try{
            const themes = await Theme.findAll({
            })
            return DataHandlor(req,themes,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
    getCoachingVideos:async (req,res)=>{
        try{
            const {theme_id} = req.query
            let where={}
            if(theme_id){
                where.theme_id = theme_id
            }
            return DataHandlor(req,await CoachingVideo.findAll({
                where,
                include:{
                    model:Theme,
                    foreignKey:'theme_id',
                    attributes:['id','name']
                }
            }),res)
    
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }


    },
    getMatieres:(req,res)=>{
        const {StudentId,NiveauScolaireId} = req.query
        if(StudentId && NiveauScolaireId){
            const data = AnneeNiveauUser.findOne({where:{
                user_id:StudentId,
                niveau_scolaire_id:NiveauScolaireId,
                
            }})
        }
        else{
            return ErrorHandlor(req,new ValidationError(),res)
        }

    },
    getTrimestres:async (req,res)=>{
         const {StudentId,NiveauScolaireId} = req.query 
            try{
                const data = await AnneeNiveauUser.findAll({
                    where:{
                        user_id:StudentId,
                        niveau_scolaire_id:NiveauScolaireId
                    },
        
                    include:[{
                        model:User,
                        foreignKey:'user_id',
                        where:{
                            addedBy:req.user.id
                        },
                        required:true
                        
                    },{
                        model:Order,
                        foreignKey:'annee_niveau_user_id',
                        where:{
                            active:true
                        },
                        include:{
                            model:Trimestre,
                            through:'orders_trimestres'
                        },
                        required:false
                        
                    }]
                 },)
                 return DataHandlor(req,data,res)
            }catch(e){
                    return ErrorHandlor(req,new SqlError(e),res)
            }


    }
    

   


    
}