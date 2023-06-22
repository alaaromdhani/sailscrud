const schemaValidation = require('../../utils/validations');
const {MatiereShema, UpdateMatiereShema} = require('../../utils/validations/MatiereSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotFoundErr = require('../../utils/errors/recordNotFound')
const {Op} = require('sequelize');
module.exports= {
    createMatiere: (req,callback)=>{

        let relatedNs //saving the the value of relatedNs le tdhi3 ba3d fi west then
        new Promise((resolve, reject) => {
          const createMatiereSchema =schemaValidation(MatiereShema)(req.body)
          if(createMatiereSchema.isValid){
            return   resolve(req.body)
          }
          else{
            return  reject(new ValidationError({message:createThemeSchema.message}))
          }
        }).then(matiere=>{
            if(matiere.ns && matiere.ns.length>0){
              return NiveauScolaire.findAll({
                where:{
                  id:{
                    [Op.in]:matiere.ns
                  },
                  active:true
                }
              })
            }
            return []
        }).then(ns=>{
            if(ns.length){
              relatedNs = ns
            }
            let data={} // we have to delete the value of ns from the data we create to avoid the error of attribute not found
            Object.keys(req.body).forEach(key=>{
                if(key!=='ns'){
                  data[key] = req.body[key]
                }
            })
            return Matiere.create(data)
        }).then(async data=>{
              if(relatedNs){
                  try{
                    await data.setNiveauScolaires(relatedNs)
                    callback(null,data)
                  }catch(e){
                    callback(new SqlError(e),null)
                  }
              }
              else{
                callback(null,data)
              }
        }).catch(err=>{
            callback(err,null)
        })

    },
  updateMatiere:(req,callback)=>{
    let relatedNs
    let subject
    new Promise((resolve, reject) => {
      const updateMatiereSchema =schemaValidation(UpdateMatiereShema)(req.body)
      if(updateMatiereSchema.isValid){
        return resolve(req.body)
      }
      else{
         return  reject(new ValidationError({message:updateMatiereSchema.message}))
      }
    }).then(matiere=>{
         return Matiere.findByPk(req.params.id)
    }).then(matiere=>{
        return new Promise((resolve, reject) => {
            if(matiere){
              subject = matiere
              return resolve(req.body)
            }
            else{
              return reject(new recordNotFoundErr())
            }
        })
    }).then(matiere=>{

      if(matiere.ns && matiere.ns.length>0){
        console.log('tab',matiere.ns)
        return NiveauScolaire.findAll({
          where:{
            id:{
              [Op.in]:matiere.ns
            },
            active:true
          }
        })
      }
      return []
    }).then(ns=>{
      console.log('relatedNs',ns)
      if(ns.length){
        relatedNs = ns

      }
      Object.keys(req.body).forEach(key=>{
        if(key!=='ns'){
         subject[key] = req.body[key]
        }
      })
      return subject.save()
    }).then(async data=>{
      if(relatedNs){
        try{
          await data.setNiveauScolaires(relatedNs)
          callback(null,data)
        }catch(e){
          callback(new SqlError(e),null)
        }
      }
      else{
        callback(null,data)
      }
    }).catch(err=>{
      if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }
    })


  }




}
