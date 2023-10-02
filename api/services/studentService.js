const { Op, Sequelize } = require("sequelize");
const UnauthorizedError = require("../../utils/errors/UnauthorizedError");
const UnkownError = require("../../utils/errors/UnknownError");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const generateCode = require("../../utils/generateCode");
const schemaValidation = require("../../utils/validations")
const { createStudentSchema } = require("../../utils/validations/StudentSchema")
const { v4: uuidv4 } = require('uuid');
const resolveError = require("../../utils/errors/resolveError");
const scoreSchema = require("../../utils/validations/UserScoreSchema");



module.exports = {
    createStudent:(req,callback)=>{
        let createdUser
        let bodyData={}
        
        if(req.body.birthDate){
            if(isNaN(new Date(req.body.birthDate))){
                return callback(new ValidationError({message:'a valid birthdate is required'}))
            }
            else{
                req.body.birthDate = new Date(req.body.birthDate).toISOString()
            }
        }
        if(req.body.niveau_scolaire_id){
            req.body.niveau_scolaire_id = parseInt(req.body.niveau_scolaire_id)
        }
        Object.keys(req.body).filter(k=>k!='pp').forEach(key => {
                bodyData[key] = req.body[key]
        });

        return new Promise((resolve,reject)=>{
                const createStudentValidation = schemaValidation(createStudentSchema)(bodyData)
                if(createStudentValidation.isValid){
                    return resolve()
                }
                else{
                    return     reject(new ValidationError({message:createStudentValidation.message}))
                }
       }).then(()=>{
            return Role.findOne({where:{name:sails.config.custom.roles.student.name}})
        }).then(r=>{
            
            return new Promise((resolve,reject)=>{
                if(r){
                   
                    return resolve(r)
                }
                else{
                   return reject(new SqlError({message:'the student role is inactive'}))     
                }
             })
        }).then(r=>{
            delete bodyData.niveau_scolaire_id
            bodyData.role_id = r.id
            bodyData.phonenumber = uuidv4()+'-'+uuidv4()
            bodyData.username = bodyData.firstName+' '+bodyData.lastName+uuidv4()
            bodyData.email = bodyData.firstName+'.'+bodyData.lastName+uuidv4()+'@madar.tn'
            bodyData.addedBy = req.user.id
            bodyData.country_id = req.user.country_id
            bodyData.state_id = req.user.state_id
            
            return User.create(bodyData)   
        }).then(u=>{
            createdUser = u
            return AnneeScolaire.findOne({where:{
                active:true
            }})
         }).then(as=>{
            if(as){
                let records=[]
                for(let i=1;i<=4;i++){
                    records.push({
                        niveau_scolaire_id:req.body.niveau_scolaire_id,
                        annee_scolaire_id:as.id,
                        user_id:createdUser.id,
                        trimestre_id:i,
                        type:'trial'
                    })
                }
                return AnneeNiveauUser.bulkCreate(records)
            }
            else{
                return Promise.reject(new UnkownError())
            }
        }).
        then(as=>{
            callback(null,createdUser)
        }).catch(e=>{
            console.log(e)
            if(e instanceof UnkownError || e instanceof ValidationError){
                callback(e)
            }
            else{
                callback(new SqlError(e))
            }

        })


    },
    removeStudent:(req,callback)=>{
        let user
        User.findByPk(req.params.id).then(s=>{
            return new Promise((resolve,reject)=>{
                if(s){
                    if(req.user.id===s.addedBy){
                        return resolve(s)
                    }else{
                        return reject(new UnauthorizedError({specific:'لا يمكنك حذف مستخدم لم تقم بإنشائه'}))
                    }
    
                }
                else{
                    return reject(new RecordNotFoundErr())
                }
            })
        }).then(s=>{
            user =s
            
        }).then(sd=>{
            return user.destroy()

        }).then(sd=>{
            callback(null,{})

        }).catch(e=>{
            (e instanceof RecordNotFoundErr || e instanceof UnauthorizedError)? callback(e):callback(new SqlError(e)) 

        })


    },
    addSchoolLevel:(req,callback)=>{
     
        return new Promise((resolve,reject)=>{
            const {niveau_scolaire_id} = req.body
            if(niveau_scolaire_id && typeof(niveau_scolaire_id)==='number'){
                return resolve()
            }
            else{
                return reject(new ValidationError())
            }
        }).then(()=>{
            //finding the student
            return User.findByPk(req.params.id)
        }).then(u=>{
           if(u){
            //verfiying that it is the parent
            if(u.addedBy===req.user.id){
               return sails.services.configservice.canAddSchoolLevel(u.id)  
            }
            else{
               return Promise.reject(new UnauthorizedError())   
            }
           }
           else{
            return Promise.reject(new RecordNotFoundErr())
           }
        })
        .then(anneescolaire=>{
                if(anneescolaire){
                 
                        return AnneeNiveauUser.bulkCreate(annee_niveau_user)
                        
                }else{
                    return []
                }

       }).then(()=>{
            callback(null,{message:'تمت إضافة مستوى دراسي بنجاح'})
        }).catch(e=>{
            console.log(e);
            (e instanceof RecordNotFoundErr || e instanceof UnauthorizedError|| e instanceof ValidationError)? callback(e):callback(new SqlError(e)) 
        })


    },

    deleteSchoolLevel:(req,callback)=>{
        const {id,NiveauScolaireId} = req.params
        AnneeNiveauUser.findAll({
            where:{
                user_id:id,
                niveau_scolaire_id:NiveauScolaireId,

            },
            include:{
                model:User,
                attributes:['addedBy'],
                foreignKey:'user_id',
                where:{
                    addedBy:req.user.id
                },
                required:true
            }
        }).then(annee_niveau_user=>{
           return new Promise((resolve,reject)=>{
            if(annee_niveau_user.length){
                return resolve(annee_niveau_user)
            }
            else{
                return reject(new RecordNotFoundErr())
            }
            })
        }).then(annee_niveau_user=>{
            return new Promise((resolve,reject)=>{
                if(annee_niveau_user.some(a=>a.order_id!=null)){
                    return reject(new ValidationError({message:'يجب عليك حذف الطلبات لهذا المستوى المدرسي'}))
                }
                if(annee_niveau_user.some(a=>a.type==='paid')){
                    return reject(new ValidationError({message:'لقد دفعت لهذا المستوى المدرسي'}))
                }
                if(annee_niveau_user.some(a=>a.type==='archieve')){
                    return reject(new ValidationError({message:'لقد دفعت لهذا المستوى المدرسي'}))
                }
                else{
                    return resolve(annee_niveau_user)
                }
            })
         }).then(annee_niveau_user=>{
            return AnneeNiveauUser.destroy({
                where:{
                    id:{
                        [Op.in]:annee_niveau_user.map(n=>n.id)
                    }
                }
            })
        }).then(sd=>{
           
            callback(null,{message:'تم حذف المستوى المدرسي بنجاح'})
        }).catch(e=>{
            console.log(e)
            let err = resolveError(e)
            callback(err)
        })



    },
    getStudentStatistics:(req)=>{
        return new Promise((resolve,reject)=>{
            const validation = schemaValidation(scoreSchema)(req.query)
            if(validation.isValid){
                return resolve()
            }
            else{
                return reject(new ValidationError({message:validation.message}))
            }
        }).then(()=>{
            let where = {}
            Object.keys(req.query).filter(k=>k!='limit').forEach(k=>{
                where[k] = req.query[k]
            })
            const limit = req.query.limit?parseInt(req.query.limit):3
            
        return StudentScore.findAll({
            where,
            include:[{
                model:NiveauScolaire,
                foreignKey:'niveau_scolaire_id',
                attributes:['name_ar'],
            },{
                model:User,
                foreignKey:'user_id',
                attributes:['profilePicture','firstName','lastName'],
            }],
            attributes:[[Sequelize.fn('sum',Sequelize.col('currentScore')),'userScore'],[Sequelize.fn('sum',Sequelize.col('totalScore')),'total']],
            group:'user_id',
            order:[['userScore','DESC']],
            limit

        }) 

        })
        

    }
    
    
   


} 