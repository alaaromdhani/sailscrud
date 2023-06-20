const { callbackPromise } = require('nodemailer/lib/shared');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const ValidationError = require('../../utils/errors/validationErrors');
const schemaValidation = require('../../utils/validations');
const { UpdateBlogShema, BlogShema } = require('../../utils/validations/BlogSchema');
const { UpdateBlogcategoryShema } = require('../../utils/validations/BlogcategorySchema');
const { Op, UnknownConstraintError } = require('sequelize');
const { resolve } = require('path');
const SqlError = require('../../utils/errors/sqlErrors');
const UnkownError = require('../../utils/errors/UnknownError');

const path = require('path');

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
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot update a role unless it is created from a lower user or yourself'}));

        }
        resolve(blog);



      });
    }).then(blog=>{
      const schemaValidation = schemaValidation(UpdateBlogcategoryShema)(req.body);
      return new Promise((resolve,reject)=>{
        if(schemaValidation.isValid){
          return resolve(blog);
        }
        else{
          return reject(new ValidationError({message:schemaValidation.message}));
        }
      });

    }).then(blog=>{
      Object.keys(req.body).forEach(key=>{
        blog[key] = req.body[key];

      });
      return  blog.save();

    }).then(blog=>{
      callback(null,blog);

    }).catch(err=>{
      console.log(err)
      if(err instanceof  ValidationError || err instanceof UnauthorizedError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }

    });



  },
  update:(req,callback)=>{

    Blog.findOne({where:{id:req.params.id},include:[{
      model:User,
      foreignKey:'addedBy',
      include:{
        model:Role,
        foreignKey:'role_id'
      }
    }]}).then(blog=>{
      return new Promise((resolve,reject)=>{
        if(!blog){
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot update a role unless it is created from a lower user or yourself'}));

        }
        resolve(blog);



      });
    }).then(blog=>{
      const updateSchemaValidation = schemaValidation(UpdateBlogShema)(req.body);
      return new Promise((resolve,reject)=>{
        if(updateSchemaValidation.isValid){
          return resolve(blog);
        }
        else{
          return reject(new ValidationError({message:updateSchemaValidation.message}));
        }
      });

    }).then(blog=>{
      Object.keys(req.body).forEach(key=>{
        blog[key] = req.body[key];

      });
      return  blog.save();

    }).then(blog=>{
      callback(null,blog);

    }).catch(err=>{
      console.log(err)
      if(err instanceof  ValidationError || err instanceof UnauthorizedError){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
      }

    });



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
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot delete a role unless it is created from a lower user or yourself'}));

        }
        resolve(blog);



      });
    }).then(blog=>{
      return blog.destroy();

    }).then(somedata=>{
      callback(null,{});

    }).catch(err=>{
      callback(err,null);

    });

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
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=blog.User.Role.weight && blog.addedBy!=req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot delete a role unless it is created from a lower user or yourself'}));

        }
        resolve(blog);



      });
    }).then(blog=>{
      return blog.destroy();

    }).then(somedata=>{
      callback(null,{});

    }).catch(err=>{
      callback(err,null);

    });

  },
  createBlog:async (req,callback)=>{
    try{
      if(req.body.banner){
        req.body.banner = parseInt(req.body.banner)
      }
      if(req.body.category_id){
        req.body.category_id = parseInt(req.body.category_id)
      }
      if(req.body.meta_img){
        req.body.meta_img = parseInt(req.body.meta_img)
      }
      let data= {}
      if(req.body.meta_img || req.body.banner){
        let uploadIds = []
        if(req.body.meta_img){
          uploadIds.push(req.body.meta_img)
        }
        if(req.body.banner){
          uploadIds.push(req.body.banner)
        }
        let uploads = await Upload.findAll({
          where:{
            id:{
              [Op.in]:uploadIds
            },
            type:'images'
          }
        })
        if(uploads.length!==uploadIds.length){
          return callback(new ValidationError({message:'a file with type image is required'}),null)
        }
      }
      Object.keys(req.body).filter(att=>att!=='mi' && att!=='b').forEach(att=>{
        data[att] = req.body[att]
      })
      const createBlogValidation =schemaValidation(BlogShema)(data)
      if(createBlogValidation.isValid){
        data.addedBy = req.user.id
        data.status = true
        return callback(null,data)
      }
      else{
        return callback(new ValidationError({message:createBlogValidation.message}),null)
      }
    }catch(e){
      return callback(new ValidationError({message:'some inputs are required'}),null)
    }
  },

  uploadFilesForBlog:async(req,blog,callback)=>{
    //i generated the options first so i can get the file uploaded file's location so i can delete it in case of failure
    let options=[];
    try{
      let bannerOptions    = await sails.services.uploadservice.optionGenerator(req,true,null,'b');
      options.push(bannerOptions);
    }
    catch(e){
      console.log('banner is not defined');
    }
    try{
      let metaImageOptions    = await sails.services.uploadservice.optionGenerator(req,true,null,'mi');
      options.push(metaImageOptions);
    }
    catch(e){
      console.log('meta_image is not defined');
    }
    callback(null,options);
    /*sails.services.uploadservice.optionGenerator(req,true,null,'mi').then(options => { //the options will be generated
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

            })   */
  }


};
