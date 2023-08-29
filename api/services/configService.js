const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const unauthorizedErr = require('../../utils/errors/UnauthorizedError');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const schemaValidation = require('../../utils/validations');
const { ModuleShema, UpdateModuleShema } = require('../../utils/validations/ModuleSchema');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');

const { Op, QueryError } = require('sequelize');
const { UpdateCTypeShemaWithUpload, UpdateCTypeShema, CTypeShemaWithUpload, CTypeShema } = require('../../utils/validations/CTypeSchema');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const { OthercourseShema, UpdateOthercourseShema } = require('../../utils/validations/OthercourseSchema');
const { default: axios } = require('axios');
const converter = {
  ctype:{validation:{withFile:{create:CTypeShemaWithUpload,update:UpdateCTypeShemaWithUpload},withoutFile:{create:CTypeShema,update:CTypeShemaWithUpload}},hasUpload:true,uploadKey:"image"},
  othercourse:{validation:{create:OthercourseShema,update:UpdateOthercourseShema},hasUpload:false}
}
module.exports = {
  
  deleteCType:(req,callback)=>{
          CType.findByPk(req.params.id,{include:{
              model:OtherCourse,
              foreignKey:'type'


          }}).then(t=>{ 
            return new Promise((resolve,reject)=>{
              if(t){
                if(t.OtherCourses && t.OtherCourses.length){
                  return reject(new UnauthorizedError({specific:'you cannot delete this type because it is related to some courses'}))
                } 
                else{
                  return resolve(t)
                }
                 
              }else{
                return reject(new RecordNotFoundErr())} 
              }) 
         }).then(t=>{ 
          return t.destroy()
          }).then(d=>{
              callback(null,{})
          }).catch(e=>{
            if(e instanceof UnauthorizedError || e instanceof ValidationError){
              callback(e,null)
            }
            else{
              callback(new SqlError(e),null)
            }
          })       
  },
  updateCType:(req,callback,withUpload)=>{
    if(req.body.ns){
      req.body.ns = JSON.parse(req.body.ns)
    }
    if(req.body.free){
      req.body.free=="true"?req.body.free=true:req.body.free=false 
    } 
    if(req.body.active && (req.body.active=="true" || req.body.active=="false")){
      req.body.active=="true"?req.body.active=true:req.body.active=false 
    }
    
    const {validation,hasUpload,uploadKey} = converter['ctype']
    let bodyData ={}
    let relatedNs
    let type
    new Promise((resolve,reject)=>{
      Object.keys(req.body).forEach(k=>{
        bodyData[k] =req.body[k]
      })
      let sValid
      if(withUpload){
        delete bodyData[uploadKey]  
        sValid =validation.withFile.update
      }
      else{
        if(req.body.thumbnail){
          req.body.thumbnail = parseInt(req.body.thumbnail) 
        }
        sValid =validation.withoutFile.update
      }
      const createValidation = schemaValidation(sValid)(bodyData)
      if(createValidation.isValid){
          return resolve(bodyData)
      } 
      else{
          return reject(new ValidationError({message:createValidation.message}))
      }
    }).then(data=>{
        return CType.findByPk(req.params.id)

    }).then((t)=>{
      return new Promise((resolve,reject)=>{
        if(t){
         return resolve(t)
        }
        else{
          return reject(new RecordNotFoundErr())
        }
      })
    }).then(t=>{
      type=t
      if(bodyData.ns){
          return NiveauScolaire.findAll({
            where:{
              id:{
                [Op.in]:bodyData.ns
              }
            }
          })
        }
        else{
          return []
        }
    }).then(ns=>{
      if(ns.length){
        relatedNs = ns 
        
      }
      delete bodyData.ns
      return type.update(bodyData)
    }).then(type=>{
      
      if(relatedNs){
        return type.setNiveauScolaires(relatedNs)
      }
      return []
    }).then(sd=>{
        callback(null,type)
    }).catch(e=>{
      console.log(e)
      if(e instanceof ValidationError){
        callback(e,null)
      }
      else{
        callback(new SqlError(e))
      }
    })

  },
    
  createCType:(req,callback,withUpload)=>{
        const {validation,hasUpload,uploadKey} = converter['ctype']
        let bodyData ={}
        let relatedNs
        let createdType
        if(req.body.ns){
          req.body.ns = JSON.parse(req.body.ns)
        }
        new Promise((resolve,reject)=>{
          Object.keys(req.body).forEach(k=>{
            bodyData[k] =req.body[k]
          })
          let sValid
          if(withUpload){
            delete bodyData[uploadKey]  
            sValid =validation.withFile.create
          }
          else{
            if(req.body.thumbnail){
              req.body.thumbnail = parseInt(req.body.thumbnail) 
            }
            sValid =validation.withoutFile.create
          }
          const createValidation = schemaValidation(sValid)(bodyData)
          if(createValidation.isValid){
              return resolve(bodyData)
          } 
          else{
              return reject(new ValidationError({message:createValidation.message}))
          }
        }).then(data=>{
            if(data.ns){
              return NiveauScolaire.findAll({
                where:{
                  id:{
                    [Op.in]:data.ns
                  }
                }
              })
            }
            else{
              return []
            }
        }).then(ns=>{
          if(ns.length){
            relatedNs = ns 
            
          }
          delete bodyData.ns
          bodyData.addedBy = req.body.id
          return CType.create(bodyData)
        }).then(type=>{
          createdType = type
          if(relatedNs){
            return type.setNiveauScolaires(relatedNs)
          }
          return []
        }).then(sd=>{
            callback(null,createdType)
        }).catch(e=>{
          if(e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e),null)
          }
        })

      },
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
            
              if( asasignedTrimestres && (asasignedTrimestres.length!=m.Trimestres.length || m.Trimestres.map(t=>t.id).filter(t=>!asasignedTrimestres.includes(t)).length)){
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
    },
    validateRecaptcha:async (token)=>{
      const {secret_key} = sails.config.custom.security.recaptcha
      return new Promise((resolve,reject)=>{
        axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`).then(data=>{
          console.log(data)
            return resolve()

        }).catch(e=>{
          return reject(new ValidationError({message:'a valid recaptcha key is required'}))

        })


        
      })


    },
    getCurrentTrimestres:(req,callback)=>{
      let today = new Date()
      return Trimestre.findOne({where:{
        
        startMonth:{
            [Op.lte]:today.getMonth()
        },
        endMonth:{
          [Op.gte]:today.getMonth()
        }

      }})

    },
    canAddSchoolLevel:async (student_id)=>{
      let studentHistory
      return AnneeNiveauUser.findAll({where:{
        user_id:student_id,
        
        type:{
          [Op.ne]:'archive'
        }
      },include:{
        model:AnneeScolaire,
        foreignKey:'annee_scolaire_id'
      },}).then(annee_niveau_users=>{
         studentHistory =annee_niveau_users 
        return  sails.services.configservice.getCurrentTrimestres()     
      }).then(t=>{
        if(studentHistory.length){
          if(t.id===3 && studentHistory.every(h=>h.AnneeScolaire.active)){
            return AnneeScolaire.findOne({where:{
              startingYear:(studentHistory.map(h=>h.AnneeScolaire).filter(a=>a.active).map(a=>a.startingYear).at(0))+1
            }})
          }
        }
        else{
          return AnneeScolaire.findOne({where:{
            active:true
          }}) 
        }


      })


    }
    
}
