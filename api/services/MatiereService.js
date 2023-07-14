const schemaValidation = require('../../utils/validations');
const {MatiereShema, UpdateMatiereShema} = require('../../utils/validations/MatiereSchema');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const recordNotFoundErr = require('../../utils/errors/recordNotFound')
const unauthorizedErr = require('../../utils/errors/UnauthorizedError')
const {Op} = require('sequelize');
const { groupBy } = require('lodash');
const { UpdateDomaineShema } = require('../../utils/validations/DomaineSchema');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');


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
                let matiere_niveau_scolaire = []
                let groupedNiveauModules= {}
                ns.forEach(d=>{
                  matiere_niveau_scolaire.push({     
                    MatiereId:data.id,
                    name:d.name,
                    NiveauScolaireId:d.NiveauScolaireId,
                    inspector:d.inspector,
                    nb_modules:d.nb_modules,
                    intern_teacher:d.intern_teacher
                    })
                    groupedNiveauModules[d.NiveauScolaireId] =d.nb_modules 
                 })
                

                let matiereNiveau  = await MatiereNiveau.bulkCreate(matiere_niveau_scolaire)
                 const groupedRecords = _.groupBy(matiereNiveau,'NiveauScolaireId')
                 let recordsToCreate = []
                 Object.keys(groupedNiveauModules).forEach(niveau_scolaires=>{
                      for(let i =0;i<groupedNiveauModules[niveau_scolaires];i++){
                        recordsToCreate.push({
                          chapitre_id:i+1,
                          name:'NOT_ASSIGNED',
                          matiere_niveau_id:groupedRecords[niveau_scolaires].at(0).id
                        })
                      }
                })
                 if(recordsToCreate.length){
                  await Module.bulkCreate(recordsToCreate)

                 }
                callback(null,createdMatiere)
              }
              else{
                callback(null,data)
              }
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
        //console.log('tab',matiere.ns)
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
          sails.services.matiereservice.handleNs(req,data,callback)
      }
      else{
        callback(null,data)
      }
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
  handleNs:(req,matiere,callback)=>{
    let groupedRecords
    let moduleRecordsToCreate = []
    let modules = []
    try{
        const inputs =req.body.ns.map(o=>{return {MatiereId:parseInt(req.params.id),NiveauScolaireId:o.NiveauScolaireId,name:o.name,intern_teacher:o.intern_teacher,inspector:o.inspector,nb_modules:o.nb_modules}}) 
        const grouping =_.groupBy(inputs,'NiveauScolaireId')
    //
          let groupedNiveauModules = {}
          let recordsToUpdate=[]
          let recordsToCreate=[]
          let recordsToDelete=[]
        MatiereNiveau.findAll({where:{MatiereId:req.params.id},include:[
          {
            model:Course,
            
            foreignKey:'matiere_niveau_id'
        }, {
          model:Module,
          
          foreignKey:'matiere_niveau_id',
          include:{model:Course,
            foreignKey:'module_id'

          }
          }

        ]}).then(async matieres_niveaux=>{
          try{
            //getting the modules
            modules = matieres_niveaux.reduce((prev,curr)=>{
                prev= prev.concat(curr.Modules)
                return prev
            },  [])
            //grouping the modules by chapitre_id to facilate looking for records
            let groupedModules = _.groupBy(modules,'chapitre_id')
            let groupedRecordsOnlyNb={} 
            groupedRecords =_.groupBy(matieres_niveaux,'NiveauScolaireId')   
            Object.keys(groupedRecords).forEach(k=>{
              groupedRecordsOnlyNb[k] = groupedRecords[k].at(0).nb_modules
            })
            inputs.filter(i=>groupedRecords[i.NiveauScolaireId]?false:true).forEach(i=>{
              
              recordsToCreate.push(i)
            })
            matieres_niveaux.forEach(mn=>{
               // console.log(mn)
              if(!grouping[mn.NiveauScolaireId]){
                  recordsToDelete.push(mn)
              }
               else if(mn.name!=grouping[mn.NiveauScolaireId].at(0).name ||mn.inspector!=grouping[mn.NiveauScolaireId].at(0).inspector||mn.intern_teacher!=grouping[mn.NiveauScolaireId].at(0).intern_teacher||mn.nb_modules!=grouping[mn.NiveauScolaireId].at(0).nb_modules ){
                  mn.name = grouping[mn.NiveauScolaireId].at(0).name
                  mn.inspector = grouping[mn.NiveauScolaireId].at(0).inspector
                  mn.intern_teacher = grouping[mn.NiveauScolaireId].at(0).intern_teacher
                  mn.nb_modules = grouping[mn.NiveauScolaireId].at(0).nb_modules
                
                  //grouping nbModules by niveauscolaire
                  groupedNiveauModules[mn.NiveauScolaireId] = grouping[mn.NiveauScolaireId].at(0).nb_modules
                  recordsToUpdate.push(mn)
              }
              console.log(grouping[mn.NiveauScolaireId])

            })
           
            
            await sails.services.matiereservice.handleModules(groupedNiveauModules,groupedRecords,groupedRecordsOnlyNb,groupedModules)
           

            if(recordsToDelete.length){
             await Promise.all(recordsToDelete.filter(mn=>!mn.Courses.length&&!mn.Modules.length).map(mn=>{
                return mn.destroy()
             }))
            }

            if(recordsToCreate.length){
              console.log(recordsToCreate)
              let mns = await MatiereNiveau.bulkCreate(recordsToCreate)
              mns.forEach(m=>{
                for(let i=1;i<=m.nb_modules;i++){
                  moduleRecordsToCreate.push({
                    chapitre_id:i,
                    name:'NOT_ASSIGNED',
                    matiere_niveau_id:m.id
                  })
                }
              })
              if(moduleRecordsToCreate.length){
                await Module.bulkCreate(moduleRecordsToCreate)
              }
            }
            if(recordsToUpdate.length){
             
              await Promise.all(recordsToUpdate.map(r=>{
                return r.save()
              }))
            }
            return callback(null,{recordsToCreate,recordsToDelete,recordsToUpdate})
          }
          catch(e){
            console.log(e)
              return callback(new SqlError(e),null)
          }
        
        }).catch(e=>{
           callback(new SqlError(e),null)

        })






        

      }catch(e){
        console.log(e)
          callback(new SqlError(e),null)

      }
       


  },
  handleModules:async (groupedNiveauModules,groupedRecords,groupedRecordsOnlyNb,groupedModules)=>{
      try{
        console.log('grouped Niveau Modules :',groupedRecordsOnlyNb)
        
       // console.log('grouped records :',groupedRecords['6'].map(i=>i.nb_modules))
        let recordsToDelete = []
      let recordsToCreate = []
      Object.keys(groupedNiveauModules).forEach(k=>{
          if(groupedNiveauModules[k]<groupedRecordsOnlyNb[k]){

            for(let i=groupedNiveauModules[k]+1;i<=groupedRecordsOnlyNb[k];i++){
              recordsToDelete.push(groupedModules[i].filter(m=>m.matiere_niveau_id==groupedRecords[k].at(0).id).at(0))
             }
          }
          else if(groupedNiveauModules[k]>groupedRecordsOnlyNb[k]){
            for(let i=groupedRecordsOnlyNb[k];i<=groupedNiveauModules[k];i++){
              recordsToCreate.push({
                chapitre_id:i,
                name:'NOT_ASSIGNED',
                matiere_niveau_id:groupedRecords[k].at(0).id 
              })
             }
          }


      })
      if(recordsToCreate.length){
          await Module.bulkCreate(recordsToCreate)
      }
      if(recordsToDelete.length){
       // console.log('module records to delete ',recordsToDelete)
          await Module.destroy({
            where:{
              id:{
                [Op.in]:recordsToDelete.filter(r=>r.Courses.length==0).map(r=>r.id)
              }
            }
          })
      }
      }
      catch(e){
        throw e
      }
 
   },
  deleteMatiere:(req,callback)=>{
    let subject 
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
                  }})
            
        }).then(m=>{
          subject = m 
          return MatiereNiveau.destroy({
            where:{
               MatiereId:m.id 
            }
          })
        }).then(m=>{
                 return subject.destroy()
        }).then(sd=>{
            callback(null,{})
        }).catch(e=>{
          callback(e,null)
        })



  },
  updateDomaine:(req,callback)=>{
    new Promise((resolve,reject)=>{
      const updateDomaineValidation = schemaValidation(UpdateDomaineShema)(req.body)
      if(updateDomaineValidation.isValid){
        return resolve(req.body)
      }
      else{
        return reject(new ValidationError({message:updateDomaineValidation.message}))
      }
    }).then(domaine=>{
      if(typeof(domaine.status)=='boolean' && !domaine.status){
        return Domaine.findByPk(req.params.id,{
          include:{
            model:Matiere,
            foreignKey:'domaine_id' 
          }
        })
      }
      else{
        return Domaine.findByPk(req.params.id)
      }
    }).then(domaine=>{
      return new Promise((resolve,reject)=>{
        if(!domaine){
          return reject(new RecordNotFoundErr()) 
        }
        if(domaine.Matieres&&domaine.Matieres.length){
          return reject(new UnauthorizedError({specific:'some subjects belongs to this domain it can be set as inactive'})) 
        }
        return resolve(domaine)
      })

    }).then(domaine=>{
      return domaine.update(req.body)
    }).then(domaine=>{
         callback(null,domaine)
    }).catch(err=>{
      console.log(err)
      if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError || err instanceof UnauthorizedError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }
    })



  },
  deleteDomaine:(req,callback)=>{
    Domaine.findByPk(req.params.id,{
      include:{
        model:Matiere,
        foreignKey:'domaine_id' 
      }
    }).then(domaine=>{
      return new Promise((resolve,reject)=>{
        if(!domaine){
          return reject(new RecordNotFoundErr()) 
        }
        if(domaine.Matieres.length){
          return reject(new UnauthorizedError({specific:'some subjects belongs to this domain it can be deleted'})) 
        }
        return resolve(domaine)
      })

    }).then(domaine=>{
      return domaine.destroy()
    }).then(sd=>{
        callback(null,{})
    }).catch(err=>{
      console.log(err)
      if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError|| err instanceof UnauthorizedError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }
    })
    


  }





}
