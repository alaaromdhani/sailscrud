const { Op } = require("sequelize")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")

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
    getPaybleTrimestres:(req,res)=>{
        return sails.services.parenthomeservice.getPaybleTrimestres(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }

        })


    },
    canAddFourthTrimestre:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.parenthomeservice.canAddForthTrimestre(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    addToCart:async (req,res)=>{
        try{
            console.log('wow')
            let data = await sails.services.parenthomeservice.addToCart(req)
            return DataHandlor(req,{message:'تمت الإضافة إلى سلة التسوق بنجاح'},res )
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    readCart:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.parenthomeservice.readCart(req),res )
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    
    addOrder:(req,res)=>{
        sails.services.parenthomeservice.addOrder(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res,data.message)
            }
        })
    },
    deleteFormCard:async (req,res)=>{
        try{
            await sails.services.parenthomeservice.deleteFormCard(req)
            return DataHandlor(req,{},res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getOrder:async (req,res)=>{
        try{
            let order =await Order.findOne({
                where:{
                    code:req.params.id,
                    addedBy:req.user.id,
                    status:{
                        [Op.in]:['active','onhold']
                    },
                },include:[{
                    
                    model:AnneeNiveauUser,
                    foreignKey:'order_id',
                    attributes:['type'],
                    include:[{
                        model:User,
                        foreignKey:'user_id',
                        attributes:['firstName','lastName']
                    
                    },{
                        model:Trimestre,
                        foreignKey:'trimestre_id',
                        attributes:['name_ar','id']
                     },{
                        model:AnneeScolaire,
                        foreignKey:'annee_scolaire_id',
                        attributes:['startingYear','endingYear']
                     },{
                        model:NiveauScolaire,
                        foreignKey:'niveau_scolaire_id',
                        attributes:['name_ar']
                     }],
                    
                },{
                    model:Pack,
                    foreignKey:'pack_id',
                    attributes:['name'],
                    include:{
                        model:Upload,
                        foreignKey:'photo',
                        attributes:['link']
                    }
                } ,{
                    model:User,
                    foreignKey:'addedBy',
                    attributes:['firstName','lastName']
                 }]
                
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
    deleteOrder:(req,res)=>{
        sails.services.parenthomeservice.deleteOrder(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }
        })

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
    getOrderByStudentAnnee:async (req,res)=>{
        if(req.params.user_id && req.params.annee_scolaire_id){
            return DataHandlor(req,await Order.findAll({include:[
                {model:AnneeNiveauUser,foreignKey:'order_id',
            where:{
                user_id:req.params.user_id ,
                annee_scolaire_id:req.params.annee_scolaire_id,
                type:'trial'
            },},{
                model:Pack,
                foreignKey:'pack_id',
                attributes:['name','nbTrimestres'],
                include:{
                    model:Upload,
                    foreignKey:'photo',
                    attributes:['link']
                }

            }]}),res)
        }
        else{
            return ErrorHandlor(req,new ValidationError(),res)
        }
    },
    

  
    
    

   


    
}