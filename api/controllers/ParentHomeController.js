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
                            },{
                                model:AnneeScolaire,
                                foreignKey:'annee_scolaire_id',
                                attributes:['startingYear','endingYear']
                            },{
                                model:NiveauScolaire,
                                foreignKey:'niveau_scolaire_id',
                                attributes:['name_ar']
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
    
    addOrder:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.orderfrontservice.addOrder(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    deleteFromCart:async (req,res)=>{
        try{
            await sails.services.parenthomeservice.deleteFromCart(req)
            return DataHandlor(req,{},res)
        }catch(e){
            console.log(e)
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
                        [Op.notIn]:['expired']
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
                    attributes:['name','nbTrimestres','price'],
                    include:{
                        model:Upload,
                        foreignKey:'photo',
                        attributes:['link']
                    }
                } ,{
                    model:User,
                    foreignKey:'addedBy',
                    attributes:['firstName','lastName','phonenumber'],
                    include:[{
                        model:Country,
                        foreignKey:'country_id',
                        attributes:['name']
                    },{
                        model:State,
                        foreignKey:'state_id',
                        attributes:['name']
                    }]
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
            const {type}=req.params
            let where ={
                addedBy:req.user.id
            }
            if(type==="all"){
                where.status = { 
                    [Op.notIn]:['expired']
                }                
            }
            
            else if(type==='active'||type==='onhold'){
                where.status=type
            }
            if(!where.status){
                return ErrorHandlor(req,new ValidationError(),res)
            }
            
            return DataHandlor(req,await Order.findAll({
            where,
            include:{
                model:Pack,
                through:'orders_packs',
                attributes:['name'],
                include:{
                    model:Upload,
                    foreignKey:'photo',
                    attributes:['link']
                }
            }    
            },),res)
        }catch(e){
            return ErrorHandlor(req, new SqlError(e),res)
        }

    },
    applicateCoupon:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.orderfrontservice.applicateCoupon(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
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
    payOrder:async (req,res)=>{
        const {type} = req.params
        if(type==='BankCart'){
            try{
                return DataHandlor(req,await sails.services.orderfrontservice.payUsingCart(req),res)
            }catch(e){
                console.log(e)
                               return ErrorHandlor(req,resolveError(e),res)
    
            }
        }
        else if(type==='prepaidCard'){
                try{
                    return DataHandlor(req,await sails.services.orderfrontservice.payUsingPrepaidCart(req),res)
                }catch(e){
                    console.log(e)
                    return ErrorHandlor(req,resolveError(e),res)
        
                }
        }
        else if(type==='virement'){
            try{
                return DataHandlor(req,await sails.services.orderfrontservice.payUsingVirement(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else if(type==='livraison'){
            try{
                return DataHandlor(req,await sails.services.orderfrontservice.payLivraison(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else{
            return ErrorHandlor(req,new ValidationError({message:'الرجاء إدخال نوع دفع صالح'}),res)
        }

    },
    verifyPayement:async (req,res)=>{
        try{
            await sails.services.orderfrontservice.verifyPayement(req)
            return DataHandlor(req,{message:'تم دفع الطلب بنجاح'} ,res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    createAdresse:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.orderfrontservice.createAdresse(req),res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getAdresses:async (req,res)=>{
        try{
            let data =await  Adresse.findAll({
                where:{
                  addedBy:req.user.id
                },
                attributes:['adresse','postal_code','phonenumber','state_id'],
                include:{
                    model:State,
                    foreignKey:'state_id',
                    attributes:['name']
                }
            })
            return DataHandlor(req,data,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
    deleteAdresse:async (req,res)=>{
        try{
            await sails.services.orderfrontservice.deleteAdresse(req)
            return DataHandlor(req,{},res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    createLivraisons:async (req,res)=>{
        try{
            await sails.services.orderfrontservice.createLivraision(req)
            return DataHandlor(req,{},res,"تم إنشاء الشحن بنجاح")
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getLivraisons:async (req,res)=>{
        try{
            return DataHandlor(req,await Livraison.findAll({where:{
                addedBy:req.user.id,
                status:'onhold',
               
            }, include:[{
                model:Adresse,
                attributes:['postal_code','state_id','adresse','phonenumber'],
                include:{
                    model:State,
                    foreignKey:'state_id',
                    attributes:['name']
                }
            },{
                model:Order,
                attributes:['code']
            }]}),res)
        }catch(e){
            //console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getMatieres:async (req,res)=>{
        try{
            let data = await AnneeNiveauUser.findOne({where:{
                id:req.params.id,
            },
            include:[{
                model:User,
                foreignKey:'user_id',
                attributes:['id'],
                where:{
                    addedBy:req.user.id
                },
                required:true
            },]

        })
        if(!data){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            let ns = data.dataValues.niveau_scolaire_id
            
            let matieres = (await NiveauScolaire.findByPk(ns,{
                include:{
                    model:Matiere,
                    through:MatiereNiveau
                }
            })).Matieres
                return DataHandlor(req,matieres,res)
            
                
        }
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }

    },
    getCourses:async (req,res)=>{
        const {id,MatiereId} = req.params
        try{
            let data = await AnneeNiveauUser.findOne({where:{
                id:id,
            },
            include:[{
                model:User,
                foreignKey:'user_id',
                attributes:['id'],
                where:{
                    addedBy:req.user.id
                },
                required:true
            },]

        })
        if(!data){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            let ns = data.dataValues.niveau_scolaire_id
            let TrimestreId = data.dataValues.trimestre_id
            let includeOptions = [{
                model:Course,
                foreignkey:'module_id',
                attributes:['id','name','rating','description'],
                where:{
                    active:true
    
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
           
            let metiere_niveau = await MatiereNiveau.findOne({
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
           
           return DataHandlor(req,{matiere:metiere_niveau.Matiere,modules:metiere_niveau.dataValues.Modules,canAccessPrivate:(data.dataValues.type==='paid')},res)

                
        }
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    


    }
   
    

  
    
    

   


    
}