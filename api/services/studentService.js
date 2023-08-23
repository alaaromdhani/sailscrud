const { Op } = require("sequelize");
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



module.exports = {
    createStudent:(req,callback)=>{
      
        let bodyData={}
        
        if(req.body.birthDate){
            if(isNaN(new Date(req.body.birthDate))){
                return callback(new ValidationError({message:'a valid birthdate is required'}))
            }
            else{
                req.body.birthDate = new Date(req.body.birthDate).toISOString()
            }
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
                   return reject(new UnkownError())     
                }
             })
        }).then(r=>{
            bodyData.role_id = r.id
            bodyData.phonenumber = uuidv4()+'-'+uuidv4()
            bodyData.username = bodyData.firstName+' '+bodyData.lastName+uuidv4()
            bodyData.email = bodyData.firstName+'.'+bodyData.lastName+uuidv4()+'@madar.tn'
            bodyData.addedBy = req.user.id
            bodyData.country_id = req.user.country_id
            bodyData.state_id = req.user.state_id
            
            return User.create(bodyData)   
        }).then(u=>{
            callback(null,u)
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
            if(niveau_scolaire_id){
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
                return AnneeNiveauUser.findAll({where:{
                    user_id:u.id,
                    type:{
                        [Op.ne]:'archive'
                    }
                    
                }})    
            }
            else{
               return Promise.reject(new UnauthorizedError())   
            }
           }
           else{
            return Promise.reject(new RecordNotFoundErr())
           }
        }).then(annee_niveau_user=>{
            if(annee_niveau_user.length){
                if(annee_niveau_user.some(a=>a.niveau_scolaire_id===req.body.niveau_scolaire_id)){
                   //school level already used
                    return Promise.reject(new ValidationError({message:'مستوى دراسي غير صالح'}))    
                }else{
                    //finding the school years already used
                    return AnneeScolaire.findAll({where:{
                        id:{
                            [Op.in]:annee_niveau_user.map(n=>n.annee_scolaire_id)
                        },
                        
                    },orderBy:[['endingYear','DESC']]})
                }
                
            }
            else{
                return []
            }
        }).then(sd=>{
            if(sd.length){
             return AnneeScolaire.findOne({where:{
                endingYear:sd[0].endingYear+1

               }})     
            }
            else{
                return AnneeScolaire.findOne({where:{
                    active:true
                 }})
            } 
       }).then(anneescolaire=>{
            let annee_niveau_user=[]
            for(let i=1;i<=4;i++){
                annee_niveau_user.push({
                    user_id:req.params.id,
                    annee_scolaire_id:anneescolaire.id,
                    trimestre_id:i,
                    niveau_scolaire_id:req.body.niveau_scolaire_id,
                    type:'trial'
                })  
            }
            return AnneeNiveauUser.bulkCreate(annee_niveau_user)


       }).then(()=>{
            callback(null,{message:'تمت إضافة مستوى دراسي بنجاح'})
        }).catch(e=>{
            (e instanceof RecordNotFoundErr || e instanceof UnauthorizedError|| e instanceof ValidationError)? callback(e):callback(new SqlError(e)) 
        })


    },
    deleteSchoolLevel:(req,callback)=>{
        const {StudentId,NiveauScolaireId} = req.query
        AnneeNiveauUser.findAll({
            where:{
                user_id:StudentId,
                niveau_scolaire_id:NiveauScolaireId
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
                if(annee_niveau_user.some(a=>a.type==='paid')){
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
            let err = resolveError(e)
            callback(err)
        })



    }
    
   


}