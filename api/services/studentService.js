const UnkownError = require("../../utils/errors/UnknownError");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const generateCode = require("../../utils/generateCode");
const schemaValidation = require("../../utils/validations")
const { createStudentSchema } = require("../../utils/validations/StudentSchema")
const { v4: uuidv4 } = require('uuid');



module.exports = {
    createStudent:(req,callback)=>{
      
        let bodyData={}
        Object.keys(req.body).filter(k=>k!='pp').forEach(key => {
                bodyData[key] = req.body[key]
        });
        return new Promise((resolve,reject)=>{
                const createStudentValidation = schemaValidation(createStudentSchema)(bodyData)
                if(createStudentValidation.isValid){
                    resolve()
                }
                else{
                    reject(new ValidationError({message:createStudentValidation.message}))
                }
       }).then(()=>{
    
            return NiveauScolaire.findOne({where:{
                    id:bodyData.niveau_scolaire_id,
                    active:true
            }})
       }).then(ns=>{
        console.log('niveau scolaire found ')
            return new Promise((resolve,reject)=>{
                if(ns){
                    return resolve()
                }
                else{
                    return reject(new ValidationError({message:'a valid niveau scolaire is required'}))
                }
            })
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
            bodyData.phonenumber = uuidv4()+' '+uuidv4()
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
   


}