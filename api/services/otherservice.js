const { parse } = require("path")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { OtherVideoShema, UpdateOtherVideoShema } = require("../../utils/validations/OtherVideoSchema")
const { OthercourseShema, UpdateOthercourseShema } = require("../../utils/validations/OthercourseSchema")
const { OtherdocumentShemaWithUpload, OtherdocumentShema, UpdatedocumentShemaWithUpload, UpdatedocumentShema } = require("../../utils/validations/OtherdocumentSchema")


module.exports={
      
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
        
        OtherCourse.findByPk(req.params.id,{
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
                return resolve(c)
              }
              else{
                return reject(new UnauthorizedError({specific:'you cannot update a record created by a higher role'}))
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



      }




}