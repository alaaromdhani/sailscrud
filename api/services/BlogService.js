const { callbackPromise } = require("nodemailer/lib/shared")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const ValidationError = require("../../utils/errors/validationErrors")
const schemaValidation = require("../../utils/validations")
const { UpdateBlogShema, BlogShema } = require("../../utils/validations/BlogSchema")
const { UpdateBlogcategoryShema } = require("../../utils/validations/BlogcategorySchema")
const { Op, UnknownConstraintError } = require("sequelize")
const { resolve } = require("path")
const SqlError = require("../../utils/errors/sqlErrors")
const UnkownError = require("../../utils/errors/UnknownError")

module.exports={
        updateBlogCategory:(req,callback)=>{
            BlogCategory.findOne({where:{id:req.params.id},include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }      
            }}).then(blog=>{
                    return new Promise((resolve,reject)=>{
                        if(!blog){
                            return reject(new RecordNotFoundErr())
                        }
                        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
                               return reject(new UnauthorizedError({specific:'you cannot update a role unless it is created from a lower user or yourself'})) 

                        }
                        resolve(blog)
                        


                    })
            }).then(blog=>{
                const schemaValidation = schemaValidation(UpdateBlogcategoryShema)(req.body)
                return new Promise((resolve,reject)=>{
                        if(schemaValidation.isValid){
                            return resolve(blog)    
                        }
                        else{
                            return reject(new ValidationError({message:schemaValidation.message}))
                        }
                })

            }).then(blog=>{
                Object.keys(req.body).forEach(key=>{
                    blog[key] = req.body[key]

                })   
                return  blog.save() 

            }).then(blog=>{
                    callback(null,blog)

            }).catch(err=>{
                callback(err,null)

            }) 



        },
        update:(req,callback)=>{
                Blog.findOne({where:{id:req.params.id},include:{
                    model:User,
                    foreignKey:'addedBy',
                    include:{
                        model:Role,
                        foreignKey:'role_id'
                    }      
                }}).then(blog=>{
                        return new Promise((resolve,reject)=>{
                            if(!blog){
                                return reject(new RecordNotFoundErr())
                            }
                            if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
                                   return reject(new UnauthorizedError({specific:'you cannot update a role unless it is created from a lower user or yourself'})) 

                            }
                            resolve(blog)
                            


                        })
                }).then(blog=>{
                    const schemaValidation = schemaValidation(UpdateBlogShema)(req.body)
                    return new Promise((resolve,reject)=>{
                            if(schemaValidation.isValid){
                                return resolve(blog)    
                            }
                            else{
                                return reject(new ValidationError({message:schemaValidation.message}))
                            }
                    })

                }).then(blog=>{
                    Object.keys(req.body).forEach(key=>{
                        blog[key] = req.body[key]

                    })   
                    return  blog.save() 

                }).then(blog=>{
                        callback(null,blog)

                }).catch(err=>{
                    callback(err,null)

                }) 



        },
        deleteBlogCategory:(req,callback)=>{
            BlogCategory.findOne({where:{id:req.params.id},include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }      
            }}).then(blog=>{
                    return new Promise((resolve,reject)=>{
                        if(!blog){
                            return reject(new RecordNotFoundErr())
                        }
                        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
                               return reject(new UnauthorizedError({specific:'you cannot delete a role unless it is created from a lower user or yourself'})) 

                        }
                        resolve(blog)
                        


                    })
            }).then(blog=>{
                 return blog.destroy()

            }).then(somedata=>{
                callback(null,{})

            }).catch(err=>{
                callback(err,null)   

            })

        },
        delete:(req,callback)=>{
            Blog.findOne({where:{id:req.params.id},include:{
                model:User,
                foreignKey:'addedBy',
                include:{
                    model:Role,
                    foreignKey:'role_id'
                }      
            }}).then(blog=>{
                    return new Promise((resolve,reject)=>{
                        if(!blog){
                            return reject(new RecordNotFoundErr())
                        }
                        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
                               return reject(new UnauthorizedError({specific:'you cannot delete a role unless it is created from a lower user or yourself'})) 

                        }
                        resolve(blog)
                        


                    })
            }).then(blog=>{
                 return blog.destroy()

            }).then(somedata=>{
                callback(null,{})

            }).catch(err=>{
                callback(err,null)   

            })

        },
        createBlog:(req,callback)=>{

            let data = {}
                req.body.category_id=parseInt(req.body.category_id)
            Object.keys(req.body).filter(key=>key!='mi'&&key!='b').forEach(key=>{
                data[key] = req.body[key]
            })        
              
            const createBlogValidation = schemaValidation(BlogShema)(data)
            new Promise((resolve,reject)=>{
                    if(createBlogValidation.isValid){
                        data.status = true
                        data.addedBy = req.user.id
                        return resolve(data)
                    }
                    else{
                        return reject(new ValidationError({message:createBlogValidation.message}))
                    }    
                
            }).then(async data=>{
               //first case upload from computer
                if (req._fileparser && req._fileparser.upstreams &&req._fileparser.upstreams.length) { 
                    return sails.services.blogservice.uploadFilesForBlog(req, data, callback)
                }
                //second case upload from library with upload ids
                else if(data.meta_img || data.banner ){
                    let files = []
                    if(data.meta_img){
                        files.push(data.meta_img)    
                    }
                    if(data.banner){
                        files.push(data.banner)    
                    }
                    
                    const found = await Upload.findAll({where:{
                        id:{
                            [Op.in]:files
                        }
                        ,type:'images'}})
                    if(found.length==files.length){
                        return callback(new UnauthorizedError({specific:'both files must exist and they must be images'}),null)
                    }
                }
                try{
                    callback(null,await Blog.create(data))
                }catch(e){
                    callback(new SqlError(e),null)
                }              


            }).catch(e=>{
                callback(e,null)
            })          
                





        },
        uploadFilesForBlog:(req,blog,callback)=>{
            //i generated the options first so i can get the file uploaded file's location so i can delete it in case of failure
            let metaImageoptions
            sails.services.uploadservice.optionGenerator(req,true,null,'mi').then(options => { //the options will be generated  
                console.log('metaImageoptions',options)
                if(options.type=='images'){
                    metaImageoptions = options  
                    return sails.services.uploadservice.optionGenerator(req,true,null,'b')

                }
                else{
                   return new Promise((resolve,reject)=>{
                        return reject(new ValidationError({message:'meta_image is required',specific:'meta_image must be an image'}))

                   })    
                }
            }).then(bannerOptions=>{
                console.log('banner options',bannerOptions)
                if(bannerOptions.type=='images'){
                    sails.services.uploadservice.updateFile(req, metaImageoptions, async (err, metaImageUpload) => {
                        if(err){
                            callback(new ValidationError({message:'meta_image is required'}),null)
    
                        }
                        else{
                            sails.services.uploadservice.updateFile(req,bannerOptions, async (err, bannerUpload) => {
                                if(err){
                                    callback(new UnkownError(),null)
                                }
                                else{
                                    try{
                                        blog.banner = bannerUpload.id
                                        blog.meta_img = metaImageUpload.id
                                        callback(null,await Blog.create(blog))
                                    }catch(e){
                                        callback(new SqlError(e),null)
                                    }
                                }
                            })
                        }
                    })   
                   

                }
                else{
                    callback(new ValidationError({message:'banner is required',specific:'banner must be an image'}))
                }
            }).catch(err=>{
                callback(err,null)
    
            })   
    }


}