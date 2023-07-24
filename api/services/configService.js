const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const unauthorizedErr = require('../../utils/errors/UnauthorizedError');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const schemaValidation = require('../../utils/validations');
const { ModuleShema, UpdateModuleShema } = require('../../utils/validations/ModuleSchema');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');

const { Op } = require('sequelize');

module.exports = {
      deleteNiveauScolaire:(req,callback)=>{
        NiveauScolaire.findByPk(req.params.id,{
            include:{
              model:Course,
              foreignKey:'niveau_scolaire_id'
            }
          }).then(m=>{
            return new Promise((resolve, reject) => {
              if(!m){
                return reject(new recordNotFoundErr())
              }
              else if(m.Courses && m.Courses.length ){
                return reject(new unauthorizedErr({specific:'you cannot delete a record with type niveauscolaire with attributed courses'}))
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
                if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
                  callback(e,null)
                }
                else{
                  callback(new SqlError(e),null)
                }
          })
      },
  deleteChapitre:(req,callback)=>{
    Chapitre.findByPk(req.params.id,{
      include:{
        model:Module,
        foreignKey:'chapitre_id'
      }
    }).then(m=>{
      return new Promise((resolve, reject) => {
        if(!m){
          return reject(new recordNotFoundErr())
        }
        else if(m.Modules && m.Modules.length ){
          return reject(new unauthorizedErr({specific:'you cannot delete a record with type chapitres with attributed courses'}))
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
      if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
        callback(e,null)
      }
      else{
        callback(new SqlError(e),null)
      }
    })
  },
  addModule:(req,callback)=>{
        new Promise((resolve,reject)=>{
             const moduleValidation = schemaValidation(ModuleShema)(req.body)
              if(moduleValidation.isValid){
                return resolve(req.body)
              }
              else{
                  return reject(new ValidationError({message:moduleValidation.message}))
              }
        }).then(m=>{
            return MatiereNiveau.findOne({
              where:{
                MatiereId:m.matiere_id,
                NiveauScolaireId:m.niveau_scolaire_id,
              }
            })
          }).then(matiere_niveau=>{
              return new Promise((resolve,reject)=>{

                if(matiere_niveau){
                    return resolve(matiere_niveau)
                }
                else{
                  return reject(new ValidationError({message:'subject and level are not related to each other'}))
                }

              })
            }).then(matiere_niveau=>{

                return Module.create({
                    matiere_niveau_id:matiere_niveau.id,
                    chapitre_id:req.body.chapitre_id,
                    name:req.body.name

                })


            }).then(m=>{
                  callback(null,m)
              }).catch(e=>{
                if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
                  callback(e,null)
                }
                else{
                  callback(new SqlError(e),null)
                }
              })


  },
  updateModule:(req,callback)=>{
        let groupedValues={}
        let groupedBytrimestres  ={}
        let allModules
        let allTrimestres
      new Promise((resolve,reject)=>{
        const updateModuleValidation = schemaValidation(UpdateModuleShema)(req.body)
        if(updateModuleValidation.isValid){
          return resolve(req.body)
        }
        else{
            reject(new ValidationError({message:updateModuleValidation.message}))
        }  
      }).then(modules=>{
        let modules_ids = []  
        
        modules.modules.forEach(m=>{
          modules_ids.push(m.id)
          groupedValues[m.id] = m  
          if(m.trimestres && m.trimestres.length){
            groupedBytrimestres[m.id] = m.trimestres
          }
          
          
        })
        return modules_ids

      }).then(ids_array=>{
          return Module.findAll({
            where:{
                id:{
                  [Op.in]:ids_array
                }
            },
            include:{
              model:Trimestre,
              through:'trimestres_modules'
            }
          })
      }).then(modules=>{
         return new Promise((resolve,reject)=>{
          if(!modules.length){
            return reject(new ValidationError('valid modules are required')) 
          }
          else{
           return resolve(modules)
          }
      })

      }).then(modules=>{
        let recordsToUpdate = []
        allModules = modules
        modules.forEach(element => {
          const newModuleNameValue = groupedValues[element.id].name
          const newModuleChapterValue =groupedValues[element.id].chapitre_id
          if(element.chapitre_id!=newModuleChapterValue || element.name!=newModuleNameValue ){
            element.chapitre_id = newModuleChapterValue
            element.name = newModuleNameValue
            recordsToUpdate.push(element)

          }


        });
        return recordsToUpdate
      
      }).then(recordsToUpdate=>{
        return Promise.all(recordsToUpdate.map(r=>r.save()))
      }).then(updatedRecords=>{
          return Trimestre.findAll()
      }).then(ts=>{
        if(Object.keys(groupedBytrimestres).length){
          let trimestresRecordsToAdd = {}
          allModules.forEach(m=>{
            const asasignedTrimestres = groupedBytrimestres[m.id]
            
              if(asasignedTrimestres.length!=m.Trimestres.length || m.Trimestres.map(t=>t.id).filter(t=>!asasignedTrimestres.includes(t)).length){
                trimestresRecordsToAdd[m.id]=ts.filter(t=>asasignedTrimestres.includes(t.id))

              }
          })
          return Promise.all(allModules.filter(m=>trimestresRecordsToAdd[m.id]!=undefined).map(m=>{
            return m.setTrimestres(trimestresRecordsToAdd[m.id])

          }))
        }
        else{
          return []
        }

        }).then(m=>{
          callback(null,m)

        }).catch(e=>{
        console.log(e)
        if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
          callback(e,null)
        }
        else{
          callback(new SqlError(e),null)
        }

       })



      



  }
}
