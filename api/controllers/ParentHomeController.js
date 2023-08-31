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
         const {StudentId,annee_scolaire_id} = req.query 
            if(!StudentId || !annee_scolaire_id){
                return ErrorHandlor(req,new ValidationError(),res)
            }
            try{
                  let student = await User.findOne({where:{
                    id:StudentId,
                    addedBy:req.user.id
                  }})
                  if(!student){
                    return ErrorHandlor(req,new RecordNotFoundErr(),res)
                    }
                        const data = await AnneeNiveauUser.findAll({
                            where:{
                                user_id:StudentId,
                                annee_scolaire_id
                            },
                
                            include:[{
                                model:Trimestre,
                                foreignKey:'trimestre_id',
                                
                                
                            }]
                         },)
                         return DataHandlor(req,data,res)
                    
            }catch(e){
                console.log(e)
                                    return ErrorHandlor(req,new SqlError(e),res)
            }


    },
    calculatePrice:async (req,res)=>{
       sails.services.parenthomeservice.calculatePrice(req,(err,data)=>{
        if(err){
            return ErrorHandlor(req, err,res)
        }
        else{
            return DataHandlor(req,data,res)
        }

       })
    },
    calculatePriceAfterCoupon:(req,res)=>{
        return sails.services.parenthomeservice.calculatePriceAfterCoupon(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }

        })

    },
    addOrder:(req,res)=>{
        sails.services.parenthomeservice.addOrder(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data.order,res,data.message)
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
                },
                
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
            where:{addedBy:req.user.id,
                status:{
                    [Op.in]:['active','onhold']
                }
            },
            include:{
                model:Pack,
                foreignKey:'pack_id',
                include:{
                    model:Upload,
                    foreignKey:'photo'
                }
            }    
            },),res)
        }catch(e){
            return ErrorHandlor(req, new SqlError(e),res)
        }

    },
    getPaybleTrimestres:(req,res)=>{
        return sails.services.parenthomeservice.getPaybleTrimestres(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }

        })


    }
  
    
    

   


    
}