const  Sequelize  = require("sequelize");
const UnauthorizedError = require("../../utils/errors/UnauthorizedError");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const schemaValidation = require("../../utils/validations");
const { SoftskillsShema, UpdateSoftskillsShema } = require("../../utils/validations/SoftskillsSchema");
const { SoftskillsdocumentShemaWithDocument, UpdateSoftskillsdocumentShema } = require("../../utils/validations/SoftskillsdocumentSchema");
const { UpdateSoftskillsthemeShema } = require("../../utils/validations/SoftskillsthemeSchema");
const { UpdateSoftskillsvideoShema } = require("../../utils/validations/SoftskillsvideoSchema");

const { ErrorHandlor } = require("../../utils/translateResponseMessage");


module.exports={
    createSoftSkills:(req,callback)=>{
        let relatedNs
        let createdSS
            new Promise((resolve,reject)=>{
                 const createSoftSkillsSchema = schemaValidation(SoftskillsShema)(req.body)
                 if(createSoftSkillsSchema.isValid){
                        return resolve(req.body) 
                 }  
                 else{
                    return reject(new ValidationError({message:createSoftSkillsSchema.message})) 
                } 
            }).then(ss=>{
                if(ss.ns){
                   return NiveauScolaire.findAll({
                    where:{
                        id:{
                            [Sequelize.Op.in]:ss.ns
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
                let data = {}
                Object.keys(req.body).filter(k=>k!='ns').forEach(k=>{
                    data[k] = req.body[k]
                })
                data.addedBy = req.user.id
                return SoftSkills.create(data)
            }).then(data=>{
                    createdSS = data
                    if(relatedNs){
                        return data.addNiveauScolaires(relatedNs)
                    }
                    return[]                            
            }).then(data=>{
                callback(null,createdSS)
            }).catch(e=>{
                console.log(e)
                if(e instanceof ValidationError){
                    callback(e,null)
                }
                else{
                    callback(new SqlError(e),null)
                }

            })

    },
    updateSoftSkills:(req,callback)=>{
        let relatedNs
        let foundRecord
            new Promise((resolve,reject)=>{
                 const createSoftSkillsSchema = schemaValidation(UpdateSoftskillsShema)(req.body)
                 if(createSoftSkillsSchema.isValid){
                        return resolve(req.body) 
                 }  
                 else{
                    return reject(new ValidationError({message:createSoftSkillsSchema.message})) 
                } 
            }).then(ss=>{
                return SoftSkills.findByPk(req.params.id,{
                        include:{
                            model:User,
                            foreignKey:'addedBy',
                            include:{
                                model:Role,
                                foreignKey:'role_id'
                            }
                        }


                })
            }).then(ss=>{
                  return new Promise((resolve,reject)=>{
                    if(ss &&ss.User&& ss.User.Role.weight<=req.role.weight&&ss.User.id!=req.user.id ){
                        return reject(new UnauthorizedError({
                            specific:'you cannot update a softskills record made by heigher user'
                        }))
                    }    
                    if(ss){

                        foundRecord = ss
                        return resolve(ss)
                    }
                    else{
                        return reject(new RecordNotFoundErr())
                    }
                })
            }).then(ss=>{
                if(req.body.ns){
                   return NiveauScolaire.findAll({
                    where:{
                        id:{
                            [Sequelize.Op.in]:req.body.ns
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
                Object.keys(req.body).filter(k=>k!='ns').forEach(k=>{
                    foundRecord[k] = req.body[k]
                })                
                return foundRecord.save()
            }).then(data=>{
                    
                    if(relatedNs){
                        return data.setNiveauScolaires(relatedNs)
                    }
                    return[]                            
            }).then(sd=>{
                callback(null,foundRecord)
            }).catch(e=>{
                console.log(e)
                if(e instanceof ValidationError || e instanceof RecordNotFoundErr || e instanceof UnauthorizedError ){
                    callback(e,null)
                }
                else{
                    callback(new SqlError(e),null)
                }

            })

    },
    deleteSoftSkills:(req,callback)=>{
        SoftSkills.findOne({where:{id:req.params.id},include:[{
            model:User,
            foreignKey:'addedBy',
            include:{
              model:Role,
              foreignKey:'role_id'
            }
          } 
        ]}).then(theme=>{
          return new Promise((resolve,reject)=>{
            if(!theme){
              return reject(new RecordNotFoundErr());
            }
            if(req.role.weight>=theme.User.Role.weight && theme.addedBy!==req.user.id){
              return reject(new UnauthorizedError({specific:'you cannot delete a soft skills unless it is created from a lower user or yourself'}));
            }
         
            resolve(theme);
          });
        }).then(theme=>{
          return theme.destroy();
    
        }).then(somedata=>{
          callback(null,{});
    
        }).catch(err=>{
          if (err instanceof ValidationError || err instanceof UnauthorizedError ||err instanceof UnauthorizedError) {
            callback(err, null)
          } else {
            callback(new SqlError(err), null)
          }
        });
    
   

    },
    updateTheme:(req,callback)=> {
        SoftSkillsTheme.findOne({
          where: {id: req.params.id}, include: {
            model: User,
            foreignKey: 'addedBy',
            include: {
              model: Role,
              foreignKey: 'role_id'
            }
          }
        }).then(theme => {
    
          return new Promise((resolve, reject) => {
            if (!theme) {
              return reject(new RecordNotFoundErr());
            }
            if (req.role.weight >= theme.User.Role.weight && theme.addedBy !== req.user.id) {
              return reject(new UnauthorizedError({specific: 'you cannot update a role unless it is created from a lower user or yourself'}));
            }
            return resolve(theme);
          });
        }).then(theme => {
          const createThemeValidation = schemaValidation(UpdateSoftskillsthemeShema)(req.body);
          return new Promise((resolve, reject) => {
            if (createThemeValidation.isValid) {
              return resolve(theme);
            } else {
              return reject(new ValidationError({message: createThemeValidation.message}));
            }
          });
    
        }).then(theme => {
          Object.keys(req.body).forEach(key => {
            theme[key] = req.body[key];
    
          });
          return theme.save();
    
        }).then(theme => {
          callback(null, theme);
    
        }).catch(err => {
          if (err instanceof ValidationError || err instanceof UnauthorizedError) {
            callback(err, null)
          } else {
            callback(new SqlError(err), null)
          }
    
        });
    
      },
      deleteTheme:(req,callback)=>{
        SoftSkillsTheme.findOne({where:{id:req.params.id},include:[{
            model:User,
            foreignKey:'addedBy',
            include:{
              model:Role,
              foreignKey:'role_id'
            }
          } 
        ]}).then(theme=>{
          return new Promise((resolve,reject)=>{
            if(!theme){
              return reject(new RecordNotFoundErr());
            }
            if(req.role.weight>=theme.User.Role.weight && theme.addedBy!==req.user.id){
              return reject(new UnauthorizedError({specific:'you cannot delete a theme unless it is created from a lower user or yourself'}));
            }
         
            resolve(theme);
          });
        }).then(theme=>{
          return theme.destroy();
    
        }).then(somedata=>{
          callback(null,{});
    
        }).catch(err=>{
          if (err instanceof ValidationError || err instanceof UnauthorizedError) {
            callback(err, null)
          } else {
            callback(new SqlError(err), null)
          }
        });
    
      },
      updateSkVideo:(req,callback)=>{
        let course;
        SoftSkillsVideo.findByPk(req.params.id,{
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
            const updateVideoCourseSchema = schemaValidation(UpdateSoftskillsvideoShema)(req.body)
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
      deleteSkVideo:(req,callback)=>{
        SoftSkillsVideo.findByPk(req.params.id,{
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
                    return reject(new UnauthorizedError({specific:'you cannot delete a softskill record cause it is created by a user higher than  you'}))
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
      createDocumentSK:(req,callback)=>{
       console.log(req.body)
        console.log('adding without file')
        if(req.body.parent){
            req.body.parent = parseInt(req.body.parent)     
        }
        if(req.body.document){
            req.body.document = parseInt(req.body.document)     
        }
        new Promise((resolve,reject)=>{
            const createSkCoursValidation = schemaValidation(SoftskillsdocumentShemaWithDocument)(req.body)  
            if(createSkCoursValidation.isValid){
                return resolve(req.body)
            }   
            else{
                return reject(new ValidationError({message:createSkCoursValidation.message}))
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
            return SoftSkillsDocument.create(dc)
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
      updateDocSK:(req,callback)=>{
        let course;
        SoftSkillsDocument.findByPk(req.params.id,{
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
            const updateDocCourseSchema = schemaValidation(UpdateSoftskillsdocumentShema)(req.body)
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
    deleteDocSK:(req,callback)=>{
            SoftSkillsDocument.findByPk(req.params.id,{
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
                        return reject(new UnauthorizedError({specific:'you cannot delete a softskill record cause it is created by a user higher than  you'}))
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
    

      





}