const { Op } = require("sequelize")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")

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
                    if(StudentId && NiveauScolaireId){
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
                                required:true,
                                attributes:[]
                                
                            },{
                                model:Trimestre,
                                foreignKey:'trimestre_id',
                                
                                
                            }]
                         },)
                         if(!data){
                            return ErrorHandlor(req,new RecordNotFoundErr(),res)
                         }
                         else{
                            return DataHandlor(req,data,res)
                         }
                    }
                    return ErrorHandlor(req,new ValidationError({message:""}),res)
                
            }catch(e){
                console.log(e)
                                    return ErrorHandlor(req,new SqlError(e),res)
            }


    },
    calculatePrice:async (req,res)=>{
        let {nbTrimestres} = req.query
        if(nbTrimestres){
            try{
                const data = await Pack.findOne({where:{
                    nbTrimestres   
                },include:{
                    model:Upload,
                    foreignKey:'photo',
                    attributes:['link']
                },})
                
                return DataHandlor(req,data?data:{},res)
            }catch(e){
               
                return ErrorHandlor(req,new SqlError(e),res)
            }
        }
        else{
            return ErrorHandlor(req,new ValidationError(),res)
        }        

    },
    addOrder:(req,res)=>{
        sails.services.parenthomeservice.addOrder(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }
        })
    },
    getOrder:async (req,res)=>{
        try{
            let order =await Order.findOne({
                where:{
                    code:req.params.id,
                    addedBy:req.user.id,
                    status:{
                        [Op.in]:['active','onhold']
                    }
                }
            })
            if(!order){
                return ErrorHandlor(req,new RecordNotFoundErr(),res)
            } else{
                return DataHandlor(req,order,res)
            }
    
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
    getOrders:async (req,res)=>{
        try{
            return DataHandlor(req,await Order.findAll({
            where:{addedBy:req.user.id}    
            }),res)
        }catch(e){
            return ErrorHandlor(req, new SqlError(e),res)
        }

    },
    deleteOrder:(req,res)=>{
        
    }
    

   


    
}