const { parse } = require("path")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OtherVideoShema, UpdateOtherVideoShema } = require("../../utils/validations/OtherVideoSchema")
const { OthercourseShema, UpdateOthercourseShema } = require("../../utils/validations/OthercourseSchema")
const { OtherdocumentShemaWithUpload, OtherdocumentShema, UpdatedocumentShemaWithUpload, UpdatedocumentShema } = require("../../utils/validations/OtherdocumentSchema")
const { setMaxListeners } = require("events")
const sequelize= require('sequelize')
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")
const RateShema = require("../../utils/validations/RateSchema")


module.exports={
    createOtherInteractive:(req,callback)=>{
          sails.services.uploadservice.zipFileUploader(req,(err,data)=>{
              if(err){
                return ErrorHandlor(req,err,res)
              }
              else{
                  return DataHandlor(req,data,res)
              }
          },'../../static/other/',"other")


    },
    createOtherCourse:(req,callback)=>{
        new Promise((resolve,reject)=>{
          const createValidation =schemaValidation(OthercourseShema)(req.body)
          if(createValidation.isValid){
            return resolve()
          }
          else{
            return reject(new ValidationError({message:createValidation.message}))
          }
        }).then(()=>{
          return CType.findByPk(req.body.type)
        }).then(t=>{
            return new Promise((resolve,reject)=>{
                if(t && t.active){
                   return  resolve(t)
                }
                else{
                  return reject(new RecordNotFoundErr())
                }
              })
        }).then(t=>{
            let data = req.body
            data.addedBy = req.user.id
            return OtherCourse.create(data)
        }).then(c=>{
          callback(null,c)
        }).catch(e=>{
          if(e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
              callback(new SqlError(e),null)
          }
        })
    
      },
      updateOtherCourse:(req,callback)=>{
        new Promise((resolve,reject)=>{
          const updateValidation = schemaValidation(UpdateOthercourseShema)(req.body)
          if(updateValidation.isValid){
            return resolve()
          }
          else{
            return reject(new ValidationError({message:updateValidation.message}))
          }
        }).then(()=>{
          return OtherCourse.findByPk(req.params.id)
        }).then(c=>{
          return new Promise((resolve,reject)=>{
            if(c){
              return resolve(c)
            }
            else{
              return reject(new RecordNotFoundErr()) 
            }
          })
        }).then(c=>{
            return c.update(req.body)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
          console.log(e)
          if(e instanceof UnauthorizedError || e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e))
          }

        })
        
      },
      deleteOtherCourse:(req,callback)=>{
        
        OtherCourse.findByPk(req.params.id)
        .then(c=>{
          return new Promise((resolve,reject)=>{
            if(c){
              if(c.addedBy && c.User.Role.weight<=req.role.weight && req.user.id!=c.addedBy){
                return reject(new UnauthorizedError({specific:'you cannot update a record created by a higher role'}))
              }
              else{
                return resolve(c)
              }
            }
            else{
              return reject(new RecordNotFoundErr()) 
            }
          })
        }).then(c=>{
            return c.destroy()
        }).then(sd=>{
            callback(null,{})
        }).catch(e=>{
          if(e instanceof UnauthorizedError || e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e))
          }

        })
        
      },
      createVideoCourse:(req,callback)=>{
        new Promise((resolve,reject)=>{
          const createValidation =schemaValidation(OtherVideoShema)(req.body)
          if(createValidation.isValid){
            return resolve()
          }
          else{
            return reject(new ValidationError({message:createValidation.message}))
          }
        }).then(c=>{
            let data = req.body
            data.rating = 0
            data.addedBy = req.user.id
            return OtherVideo.create(data)
        }).then(c=>{
          callback(null,c)
        }).catch(e=>{
          if(e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
              callback(new SqlError(e),null)
          }
        })
    


      },
      updateOtherVideo:(req,callback)=>{
        new Promise((resolve,reject)=>{
          const updateValidation = schemaValidation(UpdateOtherVideoShema)(req.body)
          if(updateValidation.isValid){
            return resolve()
          }
          else{
            return reject(new ValidationError({message:updateValidation.message}))
          }
        }).then(()=>{
          return OtherVideo.findByPk(req.params.id,{
            include:{
              model:User,
              foreignKey:'addedBy',
              include:{
                model:Role,
                foreignKey:'role_id'
              }                
            }
          })
        }).then(c=>{
          return new Promise((resolve,reject)=>{
            if(c){
              if(c.addedBy && c.User.Role.weight<=req.role.weight && req.user.id!=c.addedBy){
                return reject(new UnauthorizedError({specific:'you cannot update a record created by a higher role'}))
              }
              else{
                  return resolve(c)
              }
            }
            else{
              return reject(new RecordNotFoundErr()) 
            }
          })
        }).then(c=>{
            return c.update(req.body)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
          if(e instanceof UnauthorizedError || e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e))
          }

        })
        
      },
      deleteOtherVideo:(req,callback)=>{
        
        OtherVideo.findByPk(req.params.id,{
          include:{
            model:User,
            foreignKey:'addedBy',
            include:{
              model:Role,
              foreignKey:'role_id'
            }                
          }
          })
        .then(c=>{
          return new Promise((resolve,reject)=>{
            if(c){
              if(c.addedBy && c.User.Role.weight<=req.role.weight && req.user.id!=c.addedBy){
                return reject(new UnauthorizedError({specific:'you cannot update a record created by a higher role'}))
              }
              else{
                return resolve(c)
              }
            }
            else{
              return reject(new RecordNotFoundErr()) 
            }
          })
        }).then(c=>{
            return c.destroy()
        }).then(sd=>{
            callback(null,{})
        }).catch(e=>{
          if(e instanceof UnauthorizedError || e instanceof RecordNotFoundErr || e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e))
          }

        })
        
      }
      ,
      createOtherDocument:(req,callback,withUpload)=>{
        let bodyData ={}
        if(req.body.parent){
          req.body.parent = parseInt(req.body.parent)
        }
        
        new Promise((resolve,reject)=>{
          Object.keys(req.body).forEach(k=>{
            bodyData[k] =req.body[k]
          })
          let sValid
          
          if(withUpload){
            delete bodyData.doc  
            sValid =OtherdocumentShemaWithUpload
          }
          else{
            if(req.body.document){
              req.body.document = parseInt(req.body.document) 
            }
            sValid =OtherdocumentShema
          }
          const createValidation = schemaValidation(sValid)(bodyData)
          if(createValidation.isValid){
              return resolve(bodyData)
          } 
          else{
              return reject(new ValidationError({message:createValidation.message}))
          }
        }).then(data=>{
          bodyData.addedBy = req.user.id
          return OtherDocument.create(bodyData)
        }).then(data=>{
            callback(null,data)
        }).catch(e=>{
          if(e instanceof ValidationError){
            callback(e,null)
          }
          else{
            callback(new SqlError(e))
          }
        })



      },
      updateOtherDocument:(req,callback,withUpload)=>{
          let bodyData ={}
          if(req.body.parent){
            req.body.parent = parseInt(req.body.parent)
          }
          if(req.body.active && (req.body.active=="true" || req.body.active=="false")){
            req.body.active=='true'?req.body.active=true:req.body.active=false
          }
          new Promise((resolve,reject)=>{
            Object.keys(req.body).forEach(k=>{
              bodyData[k] =req.body[k]
            })
            let sValid
            if(withUpload){
              delete bodyData.doc  
              sValid =UpdatedocumentShemaWithUpload
            }
            else{
              if(req.body.document){
                req.body.document = parseInt(req.body.document) 
              }
              sValid =UpdatedocumentShema
            }
            const createValidation = schemaValidation(sValid)(bodyData)
            if(createValidation.isValid){
                return resolve(bodyData)
            } 
            else{
                return reject(new ValidationError({message:createValidation.message}))
            }
          }).then(data=>{
              return OtherDocument.findByPk(req.params.id,{
                include:{
                  model:User,
                  foreignKey:'addedBy',
                  include:{
                    model:Role,
                    foreignKey:'role_id'
                  }
                }
              })

          }).then((t)=>{
            return new Promise((resolve,reject)=>{
              if(t){
                  if(t.addedBy && t.User.Role.weight<=req.role.weight && t.addedBy!=req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot update a record created by a higher role'}))
                  }
                  else{
                    return resolve(t)
                  }
              }
              else{
                return reject(new RecordNotFoundErr())
              }
            })
          }).then(t=>{
              return t.update(req.body)
          }).then(d=>{
                callback(null,d)

          }).catch(e=>{
            if(e instanceof ValidationError){
              callback(e,null)
            }
            else{
              callback(new SqlError(e))
            }
          })



      },
      rateCourse:async (req,callback,type)=>{
        let modelOptions={
        }
        if(type==="interactive"){
            modelOptions.model = OtherInteractive
            modelOptions.fk = 'other_interactive_id'
        }
        if(type==="video"){
          modelOptions.model = OtherVideo
          modelOptions.fk = 'other_video_id'
        }
        if(type==="document"){
          modelOptions.model = OtherDocument
          modelOptions.fk = 'other_document_id'
        }

        try {
          const course = await modelOptions.model.findByPk(req.params.id,{
            include:{
              model:OtherCourse,
              foreignKey:'parent',
              include:{
                model:CType,
                foreignKey:'type'
              }
            }
          })
          if (course) {
    
            const rateCourseSchema = schemaValidation(RateShema)(req.body)
                  if (rateCourseSchema.isValid) {
                      try{
                        let [rate, created] = await CustomRate.findOrCreate({
                          where: {
                            ratedBy: req.user.id,
                            [modelOptions.fk]: req.params.id,
                            other_course_id:course.parent,
                            c_type:course.OtherCourse.type

                          }, defaults: {
                            ratedBy: req.user.id,
                            [modelOptions.fk]: req.params.id,
                            other_course_id:course.parent,
                            c_type:course.OtherCourse.type,
                            rating: req.body.rating
                          }
                        })
                        if (!created) {
                          rate.rating = req.body.rating
                          await rate.save()
                        }
                        const subCourseratesCount = await CustomRate.findAll({
                          where: {
                            [modelOptions.fk]: req.params.id
                          },
                          attributes: [
                            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                          ]
                        })
                        const parentCourseratesCount = await CustomRate.findAll({
                          where: {
                            other_course_id: course.parent
                          },
                          attributes: [
                            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                          ]
                        })
                        const typeCourseratesCount = await CustomRate.findAll({
                          where: {
                            c_type: course.OtherCourse.type
                          },
                          attributes: [
                            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                          ]
                        })
                          const parentCourse =course.OtherCourse 
                          let parentType = course.OtherCourse.CType

                          parentType.rating = typeCourseratesCount[0].dataValues.avgRating
                          
                          parentCourse.rating = parentCourseratesCount[0].dataValues.avgRating
                          course.rating = subCourseratesCount[0].dataValues.avgRating
                          await parentType.save()
                          await parentCourse.save()
                          return callback(null,await course.save())
                          //return DataHandlor(req, await course.save(), res)
                      }catch(e){
                        console.log(e)
                        return callback(new SqlError(e),null)
                      }
                    
                    } else {
                      return callback(new ValidationError({message: rateCourseSchema.message}),null)
                      
                    }
          } else {
            return callback(new RecordNotFoundErr(),null)
          }
        }
        catch(e){
          console.log(e)
          return callback(new RecordNotFoundErr(),null) 
        }



      },
      getNbQuestions:(course)=>{
        Obj.findAll({
               where:{
                   name:{
                       [sequelize.Op.like]:'%QS'
                   },
                   other_interactive_id:course.id
               },
               attributes:[
                   [sequelize.fn('count',sequelize.col('name')),'nbQuestions'],
                   'other_interactive_id'],
               group:'other_interactive_id'
           
           }).then(objs=>{
               if(objs.length){
                   return course.update({nbQuestion:objs[0].dataValues.nbQuestions})
               }
               else{
                   return 
               }
   
           })
       },
       saveProgress:(as,object)=>{
           //QS/QS
   
           let name = object.id.replace(as.dataValues.other_interactive_id+'/','')
           console.log('name of object',name)
          
           if(name && name.endsWith('QS/QS')){
            console.log('name of object',name)
          
            as.progression=parseInt(name.replace('QS/QS',''))
                return as.save()
           }
           else{
               return Promise.resolve()
           }   
   
   
   
       },




}