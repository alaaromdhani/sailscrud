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
             as.progression=parseInt(name.replace('QS/QS',''))
             return as.save()
        }
        else{
            return Promise.resolve()
        }   



    },
    
    calculateScore:async (req,as,object,agent)=>{
        let course
        let {student} =sails.config.custom.roles         
        if(req.role.name!=student.name){
            return Promise.resolve()
        }
        
        let name = object.id.replace(as.dataValues.c_interactive_id+'/','')
        if(name ==='TOTAL_SCORE'){
            let currenTrimestre = await sails.services.configservice.getCurrentTrimestres();
        
            return CoursInteractive.findByPk(as.dataValues.c_interactive_id,{
                attributes:['id'],
                include:{
                    model:Course,
                    foreignKey:['parent'],
                    attributes:['id','matiere_id'],
                    include:{
                        model:Module,
                        attributes:['id'],
                        foreignKey:'module_id',
                        include:{
                            model:Trimestre,
                            through:'trimestres_modules',
                            attributes:['id']
                        }
                    },
                }
             }).then(c=>{
                course = c
                return CustomStatement.findAll({where:{
                    [sequelize.Op.and]:[
                        {c_interactive_id:course.id},
                        {agent_id:agent.id  },
                        {[sequelize.Op.or]:[
                            {  name:{
                                    [sequelize.Op.like]:'%/NA'
                                }  
                            },{
                                name:{
                                    [sequelize.Op.like]:'%/TA'
                                }
                            }
                        ]}
                      ] 
                }}).then(c=>{
                   if(c.length){
                    let grouped = {}
                    Object.keys().reduce((prev,curr)=>{
                        return prev+curr
                      },0)
                    }
                   else{
                    return 0
                   }
                })
             }).then((c)=>{
                course = c
                return StudentScore.findOne({where:{
                  user_id:req.user.id,  
                  niveau_scolaire_id:req.user.AnneeNiveauUsers[0].niveau_scolaire_id,
                  annee_scolaire_id:req.user.AnneeNiveauUsers[0].annee_scolaire_id,
                  matiere_id:c.Course.matiere_id,
                  c_interactive_id:as.dataValues.c_interactive_id   
                }})
            }).then(score=>{

                let sentScore = parseInt(object.definition.name['en-US'])
                
                if(score){
                    let updated = {currentScore:sentScore}
                    if(!score.dataValues.trimestre_id){
                        if(course.Course.Module.Trimestres.map(i=>i.id).includes(currenTrimestre.id)){
                            updated.trimestre_id = currenTrimestre.id
                        }
                        
                    }
                    return score.update(updated)
                }
                else{
                    let created = {
                        niveau_scolaire_id:req.user.AnneeNiveauUsers[0].niveau_scolaire_id,
                        annee_scolaire_id:req.user.AnneeNiveauUsers[0].annee_scolaire_id,
                        matiere_id:course.Course.matiere_id,
                        c_interactive_id:as.dataValues.c_interactive_id,
                        currentScore:sentScore,
                        user_id:req.user.id,
                        totalScore:100  
                    }
                    if(course.Course.Module.Trimestres.map(i=>i.id).includes(currenTrimestre.id)){
                        created.trimestre_id = currenTrimestre.id
                    }
                    return StudentScore.create(created)
                }


            })
        }
        else{
            return Promise.resolve()
        }   



    },
    accessCourse:(req)=>{
        let type = req.params.type
        let includeOptions= {}
        if(!type ){
             type='cours'
                includeOptions={
                    model:Module,
                    foreignKey:'module_id',
                    attributes:['id'],
                    include:{
                        model:Trimestre,
                        through:'trimestres_modules',
                        attributes:['id']
                    }
                }
            }
        else{
            type='exam'
        }
        let bigInclude={
            model:Course,
            foreignKey:'parent',
            include:includeOptions,
            where:{
                niveau_scolaire_id:req.current_niveau_scolaire,
                type
            },
            required:true,
           
        }
        if(type!='cours'){
            delete bigInclude.include
        }
        return CoursInteractive.findOne(
            {where:
                {id:req.params.courseId,active:true,validity:true},
                include:bigInclude
            ,
            
          }).then(c=>{
          
            if(c){
                if(c.status==='public'){
                    return c
                }
                else{
                        let  trimestres
                        if(type==='exam'){
                            trimestres = [c.dataValues.Course.dataValues.trimestre_id]
                        }
                        else{
                            trimestres = c.dataValues.Course.dataValues.Module.dataValues.Trimestres.map(t=>t.dataValues.id)
                        }
                           
                        if(req.user.AnneeNiveauUsers.filter(ann=>ann.type='paid').map(d=>d.dataValues.trimestre_id).some(d=>trimestres.includes(d))){
                            return c
                        }
                        else{
                            return Promise.reject(new RecordNotFoundErr())
                        }
                }
                
            }
            else{
                return Promise.reject(new RecordNotFoundErr())
            }

          }).then(c=>{
            
            if(!c.dataValues.addedScript){
                return sails.services.lrsservice.addScript(c.dataValues.url,'course').then(()=>{
                    return c.update({addedScript:true})
                })
            }else{
                return c
            }
          }).then(c=>{
            return {
                  endpoint:sails.config.custom.baseUrl+'courses/'+c.dataValues.url+"/"+'index_lms.html',
                  username:req.user.firstName+' '+req.user.lastName, 
                  sex:req.user.sex  
            }
          })
    },
    isRatedByUser:(req)=>{
        let RateObject = {
            coursinteractive:{
                model:Rate,
                foreignKey:'c_interactive_id',
            },
            coursvideo:{
                model:Rate,
                foreignKey:'c_video_id',
            },
            coursdocument:{
                model:Rate,
                foreignKey:'c_document_id',
            },
            softskillsinteractive:{
                model:SoftSkillsRate,
                foreignKey:'sk_interactive_id',
            },
            softskillsvideo:{
                model:SoftSkillsRate,
                foreignKey:'sk_video_id',
            },
            softskillsdocument:{
                model:SoftSkillsRate,
                foreignKey:'sk_document_id',
            },
            otherinteractive:{
                model:CustomRate,
                foreignKey:'other_interactive_id',
            },
            otherdocument:{
                model:CustomRate,
                foreignKey:'other_document_id',
            },
            othervideo:{
                model:CustomRate,
                foreignKey:'other_video_id',
            }

        }
        if(!RateObject[req.params.type]){
            return Promise.reject(new ValidationError())
        }
        let model = RateObject[req.params.type].model
        let key = RateObject[req.params.type].foreignKey
        

        return model.count({where:{
            ratedBy:req.user.id,
            [key]:req.params.courseId
        }})

    },
    rateCourse:(req)=>{
        let RateObject = {
            coursinteractive:{
                rateModel:Rate,
                foreignKey:'c_interactive_id',
                courseModel:CoursInteractive,
                parent:Course,
                parentFK:'course_id'

            },
            coursvideo:{
                rateModel:Rate,
                foreignKey:'c_video_id',
                courseModel:CoursVideo,
                parent:Course,
                parentFK:'course_id'
            },
            coursdocument:{
                rateModel:Rate,
                foreignKey:'c_document_id',
                courseModel:CoursDocument,
                parent:Course,
                parentFK:'course_id'
            },
            softskillsinteractive:{
                rateModel:SoftSkillsRate,
                foreignKey:'sk_interactive_id',
                courseModel:SoftSkillsInteractive,
                parent:SoftSkills,
                parentFK:'parent_sk'
            },
            softskillsvideo:{
                rateModel:SoftSkillsRate,
                foreignKey:'sk_video_id',
                courseModel:SoftSkillsVideo,
                parent:SoftSkills,
                parentFK:'parent_sk'
            },
            softskillsdocument:{
                rateModel:SoftSkillsRate,
                foreignKey:'sk_document_id',
                courseModel:SoftSkillsDocument,
                parent:SoftSkills,
                parentFK:'parent_sk'
            },
            otherinteractive:{
                rateModel:CustomRate,
                foreignKey:'other_interactive_id',
                courseModel:OtherInteractive,
                parent:OtherCourse,
                parentFK:'other_course_id'
            },
            otherdocument:{
                rateModel:CustomRate,
                foreignKey:'other_document_id',
                courseModel:OtherDocument,
                parent:OtherCourse,
                parentFK:'other_course_id'
            },
            othervideo:{
                rateModel:CustomRate,
                foreignKey:'other_video_id',
                courseModel:OtherDocument,
                parent:OtherCourse,
                parentFK:'other_course_id'
            }

        }
        const {type,courseId} = req.params
        if(!RateObject[type]){
            return Promise.reject(new ValidationError())
        }
        const {rateModel,foreignKey,courseModel,parent,parentFK} = RateObject[type]
        let course,parentCourse
        return courseModel.findByPk(courseId,{
            include:{
            model:parent,
            attributes:['id'],
            foreignKey:'parent'
            },
            attributes:['id','parent']
         }).then(c=>{

            if(!c){
                return Promise.reject(new RecordNotFoundErr())
            }
            else{
                course = c
                if(type.startsWith('cours')){
                    parentCourse = c.Course
                }
                if(type.startsWith('softskills')){
                    parentCourse = c.SoftSkills
                }
                if(type.startsWith('other')){
                    parentCourse = c.OtherCourse
                }
                return rateModel.findOrCreate({where:{
                    ratedBy:req.user.id,
                    [foreignKey]:courseId
                },
                defaults:{
                    ratedBy:req.user.id,
                    [foreignKey]:courseId,
                    [parentFK]:c.parent,
                    rating:req.body.rating,
                }

            })
            }
         }).then(([r,created])=>{
            if(!created){
                return r.update({rating:req.body.rating})
            }
            else{
                return r
            }
         }).then(r=>{
           return  Promise.all( [ rateModel.findAll({
                where: {
                [foreignKey]: courseId
                },
                attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                ]
            }),
            rateModel.findAll({
                where: {
                [parentFK]: course.parent
                },
                attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                ]
            })
            ])

         }).then(([rateChild,rateParent])=>{
            console.log('child',rateChild[0].dataValues,'parent',rateParent[0].dataValues)
            return Promise.all([course.update({rating:rateChild[0].dataValues.avgRating}),parentCourse.update({rating:rateParent[0].dataValues.avgRating})]) 
         }).then(result=>{
            return result
         })
        

    }

    
    



}