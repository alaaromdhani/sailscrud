const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { UpdateCoursInteractiveShema } = require("../../utils/validations/CoursInteractiveSchema")
const {CoursDocumentShemaWithFile, UpdateCoursDocumentShema } = require("../../utils/validations/CoursdocumentSchema")
const { UpdateCoursVideoShema } = require("../../utils/validations/CoursvideoSchema")

module.exports = {
    createDocumentCourse:(req,callback)=>{
        new Promise((resolve,reject)=>{
            const createDocCoursValidation = schemaValidation(CoursDocumentShemaWithFile)(req.body)  
            if(createDocCoursValidation.isValid){
                return resolve(req.body)
            }   
            else{
                return reject(new ValidationError({message:createDocCoursValidation.message}))
            } 
        }).then(dc=>{
            return Upload.findByPk(dc.document)
        }).then(upload=>{
            return new Promise((resolve,reject)=>{
                if(!upload){
                    return reject(new ValidationError({message:'document must be valid'}))
                }
                else if(upload.type==='doc'){
                    return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:'file must be a document'}))
                }
            })
        }).then(dc=>{
            return CoursDocument.create(dc)
        }).then(dc=>{
                callback(null,dc)

        }).catch(e=>{
            if(e instanceof ValidationError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }

        })  

    },
    updateDocCourse:(req,callback)=>{
        let course;
        CoursDocument.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(cd=>{
            return new Promise((resolve,reject)=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot update a course record cause it is created by a user higher than  you'}))
                }
                else{
                    course = cd
                    return resolve(cd)

                }
            })
        }).then(cd=>{
            const updateDocCourseSchema = schemaValidation(UpdateCoursDocumentShema)(req.body)
            return new Promise((resolve,reject)=>{
                if(updateDocCourseSchema.isValid){
                        return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:updateDocCourseSchema.message}))
                }

            })
        }).then(cd=>{
            if(cd.document){
                return Upload.findByPk(cd.document)
            }
            else{
                return {type:'doc'}
            }

        }).then(upload=>{
             return new Promise((resolve,reject)=>{
                if(upload && upload.type==='doc'){
                    return  resolve(req.body)
                }
                else{   
                    return  reject(new ValidationError({message:'file of type doc is required'}))
                }
            })   
        }).then(dc=>{
                return course.update(req.body)
        }).then(c=>{

            callback(null,c)
        }).catch(e=>{
            if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })
    },
    deleteDocCourse:(req,callback)=>{
            CoursDocument.findByPk(req.params.id,{
                include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }
                }
            }).then(cd=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
                }
                else{
                    return resolve(cd)
                }
            }).then(cd=>{
                return cd.destroy()
            }).then(sd=>{
                callback(null,{})    
            }).catch(e=>{
                if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                    callback(e,null)
                  }
                  else{
                    callback(new SqlError(e),null)
                  }
            })

    },
    updateInteractiveCourse:(req,callback)=>{
        let course;
        CoursInteractive.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(cd=>{
            return new Promise((resolve,reject)=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot update a course record cause it is created by a user higher than  you'}))
                }
                else{
                    course = cd
                    return resolve(cd)
                }
            })
        }).then(cd=>{
            const updateIntercativeCourseSchema = schemaValidation(UpdateCoursInteractiveShema)(req.body)
            return new Promise((resolve,reject)=>{
                if(updateIntercativeCourseSchema.isValid){
                        return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:updateIntercativeCourseSchema.message}))
                }

            })
        }).then(dc=>{
                return course.update(req.body)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
            if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })

    },
    deleteIntercativeCourse:(req,callback)=>{
        CoursIntercative.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(cd=>{
            if(!cd){
                return reject(new RecordNotFoundErr())
            }
            else if(cd.User.role.weight<=req.role.weight &&cd.addedBy != req.user.id){
                return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
            }
            else{
                return resolve(cd)
            }
        }).then(cd=>{
            return cd.destroy()
        }).then(sd=>{
            callback(null,{})    
        }).catch(e=>{
            if( e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })

    },
    updateVideoCourse:(req,callback)=>{
        let course;
        CoursVideo.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(cd=>{
            return new Promise((resolve,reject)=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot update a course record cause it is created by a user higher than  you'}))
                }
                else{
                    course = cd
                    return resolve(cd)
                }
            })
        }).then(cd=>{
            const updateVideoCourseSchema = schemaValidation(UpdateCoursVideoShema)(req.body)
            return new Promise((resolve,reject)=>{
                if(updateIntercativeCourseSchema.isValid){
                        return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:updateIntercativeCourseSchema.message}))
                }

            })
        }).then(dc=>{
                return course.update(req.body)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
            if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })


    },
    deleteVideoCourse:(req,callback)=>{
        CoursVideo.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(cd=>{
            if(!cd){
                return reject(new RecordNotFoundErr())
            }
            else if(cd.User.role.weight<=req.role.weight &&cd.addedBy != req.user.id){
                return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
            }
            else{
                return resolve(cd)
            }
        }).then(cd=>{
            return cd.destroy()
        }).then(sd=>{
            callback(null,{})    
        }).catch(e=>{
            if( e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })

    },


}