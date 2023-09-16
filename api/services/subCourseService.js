const sequelize= require("sequelize")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { UpdateCoursInteractiveShema } = require("../../utils/validations/CoursInteractiveSchema")
const CourscommentShema = require("../../utils/validations/CourscommentSchema")
const {CoursDocumentShemaWithFile, UpdateCoursDocumentShema } = require("../../utils/validations/CoursdocumentSchema")
const { UpdateCoursVideoShema } = require("../../utils/validations/CoursvideoSchema")

module.exports = {
    createDocumentCourse:(req,callback)=>{
        console.log('adding without file')
        if(req.body.order){
            req.body.order = parseInt(req.body.order)     
        } if(req.body.parent){
            req.body.parent = parseInt(req.body.parent)     
        }
        console.log(req.body)
        if(req.body.document){
            req.body.document = parseInt(req.body.document)     
        }
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
            dc.addedBy = req.user.id
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
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
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
            console.log(e)
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
                return new Promise((resolve,reject)=>{
                    if(!cd){
                        return reject(new RecordNotFoundErr())
                    }
                    else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
                        return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
                    }
                    else{
                        return resolve(cd)
                    }

                })
                
            }).then(cd=>{
                return cd.destroy()
            }).then(sd=>{
                callback(null,{})    
            }).catch(e=>{
                console.log(e)
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
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
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
    deleteInteractiveCourse:(req,callback)=>{
        let ci
        CoursInteractive.findByPk(req.params.id,{
            include:[{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }]
        }).then(cd=>{
            return new Promise((resolve,reject)=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
                }
                else{
                    return resolve(cd)
                }

            })
        }).then(cd=>{
            return cd.destroy()
        }).then(sd=>{
            callback(null,{})    
        }).catch(e=>{
            console.log(e)
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
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
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
                if(updateVideoCourseSchema.isValid){
                        return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:updateVideoCourseSchema.message}))
                }

            })
        }).then(dc=>{
                return course.update(req.body)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
            console.log(e)
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
            return new Promise((resolve,reject)=>{
                if(!cd){
                    return reject(new RecordNotFoundErr())
                }
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
                }
                else{
                    return resolve(cd)
                }

            })
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
    commentSubCourse:(req,type,callback)=>{
        let subcourse
        let ModelReference
        const addCommentValidation = schemaValidation(CourscommentShema)(req.body)
          new Promise((resolve,reject)=>{
            if(addCommentValidation.isValid){
                 return resolve(req.body)        
            } 
            else{
                return reject(new ValidationError({message:addCommentValidation.message}))
            }     
        }).then(body=>{
            return new Promise((resolve,reject)=>{
                if(type=="interactive"){
                    ModelReference = CoursInteractive
                    return resolve() 
                }
                 if(type=="document"){
                    ModelReference = CoursDocument
                    return resolve() 
                }
                 if(type=="video"){
                    ModelReference = CoursVideo
                    return resolve()
                 }
                 if(!ModelReference){
                    return reject(new ValidationError({message:'valid cours type is required'}))
                 }


            })
        }).then(()=>{
                return ModelReference.findByPk(req.params.id,{
                    include:{
                        model:Course,
                        foreignKey:'parent'
                    }
                })
        }).then(record=>{
              return new Promise((resolve,reject)=>{
                    if(!record){
                        return reject(new RecordNotFoundErr())
                    }
                    else{
                        return resolve(record)
                    }
                })
        }).then(course=>{
            subcourse = course 
            return MatiereNiveau.findOne({where:{
                MatiereId:course.Course.matiere_id,
                NiveauScolaireId:course.Course.niveau_scolaire_id
                    
            },include:[{
                model:User,
                foreignKey:'intern_teacher',
                as:'Teacher',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            },{
                model:User,
                foreignKey:'inspector',
                as:'Inspector',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }]})            
        }).then(matiere_niveau=>{
                return new Promise((resolve,reject)=>{
                    console.log(matiere_niveau.Inspector.id)
                    if(matiere_niveau.Teacher || matiere_niveau.Inspector){
                        let r 
                        if(req.role.weight == matiere_niveau.Teacher.Role.weight && req.user.id==matiere_niveau.Teacher.id){
                                r = "teacher"
                        }
                        if(req.role.weight == matiere_niveau.Inspector.Role.weight && req.user.id==matiere_niveau.Inspector.id){
                            r = "inspector"
                        }
                        if((req.role.weight < matiere_niveau.Inspector.Role.weight) &&(req.role.weight < matiere_niveau.Teacher.Role.weight) ){
                            r='other'
                        }
                        if(!r){
                            return    reject(new UnauthorizedError({specific:'you are not one of the authoriezd people to do this'}))
                        }   
                        return resolve(req.body)
                    }
                    else{
                        return reject(new ValidationError({message:'the responsible of this subject in this school level is required'}))    
                    }
                })
        }).then(comment=>{
            comment.addedBy = req.user.id
            if(type=="interactive"){
                comment.c_interactive_id = subcourse.id
            }
            if(type=="video"){
                comment.c_video_id  = subcourse.id  
            }
            if(type=="document"){
                comment.c_document_id  = subcourse.id  
            }
            comment.course_id = subcourse.Course.id
            return CoursComment.create(comment)

        }).then(comment=>{
            callback(null,comment)
        }).catch(e=>{
              if( e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })

    },
    updateCoursComment:(req,callback)=>{
        let comment;
        CoursComment.findByPk(req.params.id,{
            include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }
            }
        }).then(c=>{
            return new Promise((resolve,reject)=>{
                if(!c){
                    return reject(new RecordNotFoundErr())
                }
                else if(c.User.Role.weight<=req.role.weight && c.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot update a comment record cause it is created by a user higher than  you'}))
                }
                else{
                    comment = c
                    return resolve(c)
                }
            })
        }).then(cd=>{
            const updateCommentValidation = schemaValidation(CourscommentShema)(req.body)
            return new Promise((resolve,reject)=>{
                if(updateCommentValidation.isValid){
                        return resolve(req.body)
                }
                else{
                    return reject(new ValidationError({message:updateCommentValidation.message}))
                }

            })
        }).then(c=>{
                return comment.update(c)
        }).then(c=>{
            callback(null,c)
        }).catch(e=>{
            console.log(e)
            if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof SqlError || e instanceof UnauthorizedError){
                callback(e,null)
              }
              else{
                callback(new SqlError(e),null)
              }
        })


    },
    deleteCoursComment:(req,callback)=>{
        CoursComment.findByPk(req.params.id,{
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
                else if(cd.User.Role.weight<=req.role.weight && cd.addedBy != req.user.id){
                    return reject(new UnauthorizedError({specific:'you cannot delete a course record cause it is created by a user higher than  you'}))
                }
                else{
                    return resolve(cd)
                }

            })
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
    getNbQuestions:(course)=>{
     Obj.findAll({
            where:{
                name:{
                    [sequelize.Op.like]:'%QS'
                },
                c_interactive_id:course.id
            },
            attributes:[
                [sequelize.fn('count',sequelize.col('name')),'nbQuestions'],
                'c_interactive_id'],
            group:'c_interactive_id'
        
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

        let name = object.id.replace(as.dataValues.c_interactive_id+'/','')
        if(name && name.endsWith('QS/QS')){
            console.log('a little message for you ',name.replace('QS/QS',''))
             as.progression=parseInt(name.replace('QS/QS',''))
             return as.save()
        }
        else{
            return Promise.resolve()
        }   



    }
    
    



}