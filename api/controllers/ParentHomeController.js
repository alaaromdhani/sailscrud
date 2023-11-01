const { Op} = require("sequelize")
const sequelize = require('sequelize')
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const resolveError = require("../../utils/errors/resolveError")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")


module.exports={
    getThemes:async (req,res)=>{
        
        try{
            let activeOrder = await sails.services.parenthomeservice.canAccessCoachingVideos(req)
            if(!activeOrder){
                throw new UnauthorizedError()
            }
        
            const themes = await Theme.findAll({
            })
            return DataHandlor(req,themes,res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getCoachingVideos:async (req,res)=>{
        
        try{
            let activeOrder = await sails.services.parenthomeservice.canAccessCoachingVideos(req)
            if(!activeOrder){
                throw new UnauthorizedError()
            }
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
            return ErrorHandlor(req,resolveError(e),res)
        }


    },
    canAccessCoachingVideos:async (req,res)=>{
        try{
            let activeOrder = await sails.services.parenthomeservice.canAccessCoachingVideos(req)
            let canAccessCv= false
            if(activeOrder){
                canAccessCv=true
            }
           return DataHandlor(req,{canAccessCv},res)
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
                                where:{active:true}
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
           
             await sails.services.parenthomeservice.addToCart(req)
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
                    include:{
                        model:Upload,
                        foreignKey:'image',
                        attributes:['link']
                    },
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
                attributes:['id','name','rating','description','order'],
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
    


    },
    getChildren:async (req,res)=>{
        const {id,courseId} = req.params
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
            throw new RecordNotFoundErr()
        }
       
            
        let course =  await Course.findOne({
            where:{
                id:courseId,
                type:'cours',
                niveau_scolaire_id:data.dataValues.niveau_scolaire_id,
                active:true
            },
            attributes:['id','niveau_scolaire_id','active','name'],
           include:[{
            model:Module,
            required:true,
            foreignkey:'module_id',
            include:{
                  model:Trimestre,
                  through:'trimestres_modules',
                   attributes:['id'] ,
                   where:{
                    id:data.dataValues.trimestre_id
                    },
                    required:true
            },

            },{
               model:CoursInteractive,
               
               foreignkey:'parent',
               attributes:['id','name','description','thumbnail','rating','status','nbQuestion','order','tracked'],
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
           ]

        }) 
         if(!course){
            throw new RecordNotFoundErr()
        }
        else{
            
            return DataHandlor(req,{course,canAccessPrivate:(data.dataValues.type==='paid')},res)

        }       
 
        }         

        catch(e){
            
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getResults : async (req,res)=>{
        const {id,courseId} = req.params
        let data = await AnneeNiveauUser.findOne({where:{
                id:id,
               },
                include:[{
                model:User,
                foreignKey:'user_id',
             
                where:{
                    addedBy:req.user.id
                },
                required:true
            },]
        }) 
        if(!data){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }  
        sails.services.lrsservice.generateAgent(data.dataValues.User,(err,data)=>{
            if(!err){
                CustomObject.findAll({where:{
                    agent_id:data.id,
                    c_interactive_id:courseId
                }
                }).then(objs=>{
                    return new Promise((resolve,reject)=>{
                        if(objs.length==0){
                            return reject({data:{status:false,message:'user did not open the course because there are no statemnets'}})
                        }
                        else{
                            return resolve(objs)
                        }
                    })
                }).then(objects=>{
                    
                   return new Promise((resolve,reject)=>{
                        let results ={}  
                       let grouped = objects.reduce((pv,cv)=>{
                                  const test = parseInt(cv.description)
                                pv[cv.name]=test?test:cv.description
                                return pv
                        },{})
                        
                        if(grouped['QST']){
                           //   console.log(grouped)                        
                            //console.log(Object.keys(grouped))
                                if(grouped['QST']!==NaN && typeof(grouped['QST'])=='number'){
                                    results.numberOfQuestion =grouped['QST']
                                    results.score =grouped['TOTAL_SCORE']
                                    results.result_slide =(grouped['Results/RESULTS']==="true")?true:false
                                
                                    results.questions = []
                                    for(let i=0;i<grouped['QST'];i++){
                                        if(grouped[(i+1)+'QS/TA'] &&grouped[(i+1)+'QS/NA']){
                                            results.questions.push({
                                                name:(i+1)+'QS',
                                                experienced:grouped[(i+1)+'QS/QS']=='true'?true:false,
                                                results: {
                                                  TA:  grouped[(i+1)+'QS/TA'],
                                                  NA:grouped[(i+1)+'QS/NA']
                                                }
  
                                            })
  
                                        }
                                        else{
                                            results.questions.push({
                                                name:(i+1)+'QS',
                                                experienced:grouped[(i+1)+'QS/QS']=='true'?true:false,
                                            })
                                        }     
                                    }       
                                    return resolve(results)
                                }   
                                else{
                                    return reject({data:{status:false,message:'input error'}})
                                } 
                        }
                        else{
                            return reject({data:{status:false,message:'still not opened the course because the total questions is still null'}})
  
                        }
                     
                        
                 
                   })
  
  
                }).then(d=>{
                    res.status(200).send({data:d})
                   }).catch(e=>{
                    res.status(200).send({data:e})
  
                   })
  
            }
            else{
  
              return ErrorHandlor(req,err,res)
            }
            
  
  
        })
  
  
  
    },
    getMatieresWithStudentProgress:async (req,res)=>{
        const {id} = req.params
        let ann = await AnneeNiveauUser.findOne({where:{
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
        if(ann){
            let data = await  MatiereNiveau.findAll({where:{
                NiveauScolaireId:ann.dataValues.niveau_scolaire_id,
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
                                user_id:ann.dataValues.user_id
                            },
                            required:true,
                            
                        },
                        attributes:['agent_id','progression']

                    }

                }
            }]
        
            })
            return DataHandlor(req,data.map(d=>{ return {matiere:d.Matiere,total:(d.dataValues.sumNbQuestion!=='null'?d.dataValues.sumNbQuestion:0),attempted:(d.dataValues.sumProgression!=='null'?d.dataValues.sumProgression:0)}}),res)
        }
        else{
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
    },
    getExams:async (req,res)=>{
        try{
            const {id,MatiereId} = req.params
            let data = await AnneeNiveauUser.findOne({where:{
                id,
              
            },
            include:{
                model:User,
                foreignKey:'user_id',
                required:true,
                where:{
                    addedBy:req.user.id,
                },
                attributes:['addedBy']

            }}) 
            if(!data){
                throw new RecordNotFoundErr()
            }
            let exams = await Course.findAll({where:{
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
            return DataHandlor(req,exams,res)
        }catch(e){
                return ErrorHandlor(req,resolveError(e),res)

        }
            
     

    },
    getExamsChildren:async (req,res)=>{
        try{
            const {id} = req.params
            let data = await AnneeNiveauUser.findOne({where:{
                id,
                }, include:{
                    model:User,
                    foreignKey:'user_id',
                    required:true,
                    where:{
                        addedBy:req.user.id,
                        
                    },
                    attributes:['addedBy']
                }
            })
               
            if(!data){
                throw new RecordNotFoundErr()
            }
            let canAccessPrivate=(data.dataValues.type==='paid')
            let exams = await Course.findOne({where:{
                id:req.params.courseId,
                trimestre_id:data.dataValues.trimestre_id,
                type:'exam',
                niveau_scolaire_id:data.dataValues.niveau_scolaire_id,
                active:true,
            
                },    
                attributes:['id','name','description','rating'],
                    include:{
                        model:CoursInteractive,
                        foreignKey:'parent',
                        attributes:['id','name','description','thumbnail','rating','status','nbQuestion','tracked'],
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
                }

                })
            if(!exams){
                throw new RecordNotFoundErr() 
            }
            return DataHandlor(req,{exams,canAccessPrivate},res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)

        }
    },
    getCtypes:async (req,res)=>{
        try{
            let data = await sails.services.otherfrontservice.getCtypes(req)
            return DataHandlor(req,data,res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getOtherCourse:async (req,res)=>{
        try{
            let data = await sails.services.otherfrontservice.getOthersByCtype(req)
            return DataHandlor(req,data,res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getOtherChildren:async (req,res)=>{
        try{
            let data = await sails.services.otherfrontservice.getOtherChildren(req)
            return DataHandlor(req,data,res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }   

    },
    
    


   
    

  
    
    

   


    
}