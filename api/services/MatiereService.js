const schemaValidation = require('../../utils/validations');
const {MatiereShema, UpdateMatiereShema} = require('../../utils/validations/MatiereSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotFoundErr = require('../../utils/errors/recordNotFound')
const unauthorizedErr = require('../../utils/errors/UnauthorizedError')
const {Op} = require('sequelize');


module.exports= {
    createMatiere: (req,callback)=>{
        let createdMatiere
        let relatedNs //saving the the value of relatedNs le tdhi3 ba3d fi west then hhhhhhhh 
        new Promise((resolve, reject) => {
          const createMatiereSchema =schemaValidation(MatiereShema)(req.body)
          if(createMatiereSchema.isValid){
            return   resolve(req.body)
          }
          else{
            return  reject(new ValidationError({message:createMatiereSchema.message}))
          }
        }).then(matiere=>{
            if(matiere.ns && matiere.ns.length>0){
              return NiveauScolaire.findAll({
                where:{
                  id:{
                    [Op.in]:matiere.ns.map(n=>n.NiveauScolaireId)
                  },
                  active:true
                }
              })
            }
            return []
        }).then(ns=>{
            return new Promise((resolve,reject)=>{
              if(req.body.ns && req.body.ns.length!=ns.length){
                  return reject(new ValidationError({message:'valid niveau scolaire is reaquired'}))
              }
              else{
                if(ns.length){
                  relatedNs = ns
                }
                let data={} // we have to delete the value of ns from the data we create to avoid the error of attribute not found
                Object.keys(req.body).forEach(key=>{
                    if(key!=='ns'){
                      data[key] = req.body[key]
                    }
                })
                return resolve(data)              
              }

            })
            
        }).then(data=>{
            return Matiere.create(data)
        }).then(async data=>{
              if(relatedNs){
                createdMatiere = data    
                const ns = req.body.ns
                    return ns.map(d=>{
                        return {     
                          MatiereId:data.id,
                          name:d.name,
                          NiveauScolaireId:d.NiveauScolaireId
                          }
                    })
              }
              else{
                callback(null,data)
              }
        }).then(matiere_niveau_scolaire=>{
            return MatiereNiveau.bulkCreate(matiere_niveau_scolaire)
        }).then(sd=>{
            callback(null,createdMatiere)
        }).catch(err=>{
          console.log(err)
          if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError){
            callback(err,null)
          }
          else{
            callback(new SqlError(err),null)
          }
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
         if(typeof (req.body.active)==='boolean' && !req.body.active){
           return Matiere.findByPk(req.params.id,{
             include:{
               model:Course,
               foreignKey:'matiere_id'
             }
           })
         }
          return Matiere.findByPk(req.params.id)
    }).then(matiere=>{
        return new Promise((resolve, reject) => {
            if(!matiere){
              return reject(new recordNotFoundErr())
            }
            else if(matiere.Courses && matiere.Courses.length){
              return reject(new unauthorizedErr({
                specific:'you can\'t set this matiere as inactive cause it belongs to some courses'
              }))
            }
            else{
              subject = matiere
              return resolve(req.body)
            }
        })
    }).then(matiere=>{

      if(matiere.ns && matiere.ns.length>0){
        console.log('tab',matiere.ns)
        return NiveauScolaire.findAll({
          where:{
            id:{
              [Op.in]:matiere.ns.map(d=>d.NiveauScolaireId)
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
        return MatiereNiveau.destroy({
            where:{
              id:data.id  
            }
          })
      }
      else{
        callback(null,data)
      }
    }).then(sd=>{
        console.log(sd)
        let groupedData = req.body.ns.map(d=>{
          return {
            MatiereId:subject.id,
            NiveauScolaireId:d.NiveauScolaireId,
            name:d.name
          }

        })
        return MatiereNiveau.bulkCreate(groupedData)

    }).then(data=>{
        callback(null,subject)

    }).catch(err=>{
      if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }
    })


  },
  deleteMatiere:(req,callback)=>{
        Matiere.findByPk(req.params.id,{
            include:{
              model:Course,
              foreignKey:'matiere_id'
            }
        }).then(m=>{
            return new Promise((resolve, reject) => {
                  if(!m){
                    return reject(new recordNotFoundErr())
                  }
                  else if(m.Courses && m.Courses.length ){
                    return reject(new unauthorizedErr({specific:'you cannot delete matiere with courses attributed to it'}))
                  }
                  else{
                      return resolve(m)
                  }
            })
        }).then(m=>{
              return m.destroy()
        }).then(sd=>{
            callback(null,{})
        }).catch(e=>{
          callback(e,null)
        })



  }




}
