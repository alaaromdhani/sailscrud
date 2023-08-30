const path = require('path');
const ValidationError = require('../../utils/errors/validationErrors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const UnkownError = require('../../utils/errors/UnknownError');
const SqlError = require('../../utils/errors/sqlErrors');
const {DataTypes} = require('sequelize');
const yauzl = require("yauzl")
const xml2js = require('xml2js')
const CoursInteractiveShema = require('../../utils/validations/CoursInteractiveSchema')
const SchemaValidation = require('../../utils/validations');
const schemaValidation = require('../../utils/validations');
const sqlError = require('../../utils/errors/sqlErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const parser = xml2js.Parser()

module.exports = {
  fileUploader:(req,callback)=>{
    new Promise((resolve,reject)=>{
      if(req._fileparser.upstreams.length){
        let filename =  req._fileparser.upstreams[0]._files[0].stream.filename;
        return resolve(filename);
      }
      else{
        return reject(new ValidationError({message:'file is reaquired'}));
      }


    }).then(filename=>{
      let options ={};

      return new Promise((resolve,reject)=>{
        const extension = filename.split('.').pop();
        const allowedExtentions = sails.config.custom.files.extensions;
        const type = Object.keys(allowedExtentions).filter(key=>allowedExtentions[key].includes(extension)).at(0);
        if(type){
          options.file_original_name= filename;
          options.file_name =  uuidv4();
          options.type = type;
          options.extension =extension;
          const currentDate = new Date();
          const  currentDirName = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1);
          options.assetsDir = path.join(__dirname,'../../assets/uploads/lib/'+currentDirName);
          options.path = 'uploads/lib/'+currentDirName;
          options.dirname =options.assetsDir;
          options.saveAs = options.file_name+'.'+extension;
          options.uploadParameter='upload';
          return resolve(options);

        }
        else{
          return reject(new ValidationError({message:'extention is required'}));

        }

      });


    }).then(options=>{
      sails.services.uploadservice.updateFile(req,options,callback);
    }).catch(err=>{
      callback(err,null);
    });



  },
  updateFile:(req,options,callback)=>{

    let isPublic = options.isPublic?true:false;
    let uploadParameter = options.uploadParameter?options.uploadParameter:'upload';

    fs.mkdir(options.assetsDir,{recursive:true},(err)=>{
      if(err){
        callback(new UnkownError(),null);
      }

      else{
        const {saveAs,dirname} = options;
        try{
          req.file(uploadParameter).upload({dirname,saveAs},async (err,upoadedFiles)=>{
            if(err){

              console.log(err);
              callback(new UnkownError(),null);

            }
            else{
              const {file_original_name,file_name,type,extension,path} = options;
              let link = sails.config.custom.baseUrl+''+file_name;
              let addedBy = req.user.id;
              let file_size;
              try{
                file_size=upoadedFiles[0].size;
              }catch(e){
                file_size=124;
              }


              try{

                callback(null,await Upload.create({file_original_name,file_name,type,extension,file_size,path,link,isPublic,addedBy}));
              }
              catch(e){
                callback(new SqlError(e),null);

              }
            }


          });

        }catch(e){
          throw e;
        }



      }
    });
  },
  optionGenerator:(req,isPublic,dirname,uploadParameter)=>{
    let filename;

    return new Promise((resolve,reject)=>{
      try{
        if(!uploadParameter){
          uploadParameter='upload';
        }

        let upstream = req._fileparser.upstreams.filter(u=>u.fieldName==uploadParameter).at(0);
        if(upstream){
          filename = upstream._files[0].stream.filename;
        }
        if(!filename){
          return reject(new ValidationError({message:uploadParameter+' is required'}));
        }
        if(!dirname){
          dirname = 'uploads/lib/';
        }
        let options ={};


        const extension = filename.split('.').pop();
        const allowedExtentions = sails.config.custom.files.extensions;
        const type = Object.keys(allowedExtentions).filter(key=>allowedExtentions[key].includes(extension)).at(0);
        if(type){
          options.file_original_name= filename;

          options.file_name =  uuidv4();
          options.type = type;
          options.extension =extension;
          const currentDate = new Date();
          const  currentDirName = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1);
          options.assetsDir = path.join(__dirname,'../../assets/'+dirname+currentDirName);
          options.path = dirname+currentDirName;
          options.dirname =options.assetsDir;
          options.saveAs = options.file_name+'.'+extension;
          options.uploadParameter=uploadParameter?uploadParameter:'upload';
          options.isPublic =isPublic;
          return resolve(options);

        }
        else{
          return reject(new ValidationError({message:'extention is required'}));

        }
      }catch(e){
        return reject(new ValidationError({message:'file is required'}));
      }
    });
  },
  optionsGeneratorV2:async (file,parameter)=>{

    let options = {};

    return new Promise((resolve,reject)=>{
      const extention= file.originalname.split('.').pop();
      if(!extention){
        return reject(new ValidationError({message:'extention is required'}));
      }
      let today = new Date()
      if(!parameter.destination){
        parameter.destination = '../../assets/uploads/'+today.getFullYear()+'-'+today.getMonth()
      }


      const type = Object.keys(sails.config.custom.files.extensions).filter(ext=>sails.config.custom.files.extensions[ext].map(item=>item.toLowerCase()).includes(extention.toLowerCase())).at(0);

      if(!type){
        return reject(new ValidationError({message:'a valid type is required'}));

      }
      if(parameter.type &&  parameter.type!==type){
        return reject(new ValidationError({message:'a file with type'+parameter.type+"is required"}))
      }

      options.file_original_name = file.originalname;
      options.isPublic=typeof (parameter.isPublic)==='boolean'?options.isPublic=parameter.isPublic:false;
      options.path=parameter.destination.split('assets/').pop();
      options.file_name=uuidv4();
      options.type = type;
      options.file_size = file.size?file.size:1234;
      options.extension = extention;
      fs.mkdir(path.join(__dirname,parameter.destination),{recursive:true},err => {
        if(err){
            return reject(new UnkownError())
        }
        else{
           return  resolve(options)
        }


      })
    });


  },
  zipFileOptions:async (file,parameter)=>{
    let options = {};
    return new Promise((resolve,reject)=>{
      const extention= file.originalname.split('.').pop();
      if(!extention){
        return reject(new ValidationError({message:'extention is required'}));
      }
      let today = new Date()
      if(!parameter.destination){
        parameter.destination = '../../static/courses/'+today.getFullYear()+'-'+today.getMonth()+"/"+uuidv4()
      }
      const type = Object.keys(sails.config.custom.files.extensions).filter(ext=>sails.config.custom.files.extensions[ext].map(item=>item.toLowerCase()).includes(extention.toLowerCase())).at(0);
      if(!type){
        return reject(new ValidationError({message:'a valid type is required'}));
      }
      if(parameter.type &&  parameter.type!==type){
        //console.log("type",type)
        return reject(new ValidationError({message:'a file with type '+parameter.type+" is required"}))
      }
      options.file_original_name = file.originalname;
     // options.isPublic=typeof (parameter.isPublic)==='boolean'?options.isPublic=parameter.isPublic:false;
     if(!parameter.path){
      options.path=parameter.destination.split('courses/').pop();
     }
     else{
      options.path  =parameter.path
     } 
      
      options.file_name=uuidv4();
      options.type = type;
      options.file_size = file.size?file.size:1234;
      options.extension = extention;
      fs.mkdir(path.join(__dirname,parameter.destination),{recursive:true},err => {
        
        if(err){
            return reject(new UnkownError())
        }
        else{
           return  resolve(options)
        }
      })
    });
  },
  zipFileUploader:(req,callback,homePath,type)=>{
      if(req.operation){
          if(!type){
            type="interactive"
          }       
         if(req.operation.error){

              console.log("error operation ")  
            return callback(req.operation.error,null)
          } 
          else{
            let objs = []
            let courseId
            const upload = req.operation.data
            if(!homePath){
                  homePath = '../../static/courses/' 
            }
            const uploadBasePath = path.join(__dirname,homePath+upload.path)
                    yauzl.open(path.join(__dirname,homePath+upload.path+"/"+upload.file_name+"."+upload.extension),{lazyEntries:true},(err,zipFile)=>{
                   if(err){
                    console.log(err)
                    return  callback(new SqlError(err),null)
                  } 
                   else{
                    let entries = []
                    zipFile.readEntry()
                    zipFile.once("end",()=>{
                      console.log('ended unzipping the file successfully')
                     if(type=="interactive" || type==="other"){
                         console.log(entries)
                       if(type=='other'){
                        req.operation.courseType="other"
                       }
                       else{
                        req.operation.courseType="cours"
                       } 
                       return sails.services.uploadservice.handlexmlFile(req,objs,courseId,callback,uploadBasePath)
                     }
                     
                     else{
                        return callback(null,{courseId})
                     }
                    })
                    zipFile.on("entry",async (entry)=>{
                      
                      if (/\/$/.test(entry.fileName)) {
                        console.log('found directory ' , entry.fileName)
                        fs.mkdir(path.join(uploadBasePath,entry.fileName),{recursive:true},err => {
                          if(err){
                              return callback(new SqlError(err),null) 
                          }
                          else{
                              zipFile.readEntry()
                          }
                         })
                      }
                      else{
                        entries.push(entry.fileName)
                        
                          const filePath = path.join(uploadBasePath,entry.fileName)
                          const fileDirectory = path.dirname(filePath)
                          if (!fs.existsSync(fileDirectory)) {
                            fs.mkdirSync(fileDirectory, { recursive: true })
                          }
                        try{
                          zipFile.openReadStream(entry,(err,readStream)=>{
                            if(err){
                            return  callback(new SqlError(err),null)
                            }
                            else{
                                     if(entry.fileName==='tincan.xml'){
                                         readStream.on('data',async chunk=>{
                                           await parser.parseString(chunk,(err,result)=>{
                                               if(!err){
                                               try{
                                                result.tincan.activities[0].activity.forEach(element => {
                                                  objs.push({
                                                      id:element.$.id,
                                                      type:element.$.type,
                                                      name:element.name[0]._,
                                                      description:element.name[0]._,
                                                      course_id:null
                                                  })
                                          
                                                  if(element.launch){
                                                  courseId =element.$.id
                                                  }
                                                });
                                               }
                                               catch(e){
                                                console.log(e)
                                               }
                                               }
                                               else{
                                                 console.log(err)
                                               }
                                           })
                                         })
                                       }
                                     try{
                                         readStream.on("end",()=>{
                                           zipFile.readEntry()
                                         })
                                         readStream.pipe(fs.createWriteStream(path.join(uploadBasePath,entry.fileName)))
                                       } 
                                       catch(e){
                                         console.log(e)
                                         return callback(new SqlError(e))
 
                                       }
                               } 
                           
                           })
                        }catch(e){
                          console.log(e)
                          return callback(new ValidationError({message:'valid xapi cours is required'}))
                        }
                      }
                      
                    })
         
                  }
                })      
              } 
      }
      else{
        callback(new ValidationError({message:'zipfile is required'}),null)
      }
    },
    saveCourse:async (req,objs,courseId,callback)=>{
        if(!courseId){
            return callback(new ValidationError({message:'valid xapi course is required'}))
        }
        else{
        let course = req.body

       delete course.zipFile
          course.rating = 0
          course.addedBy = req.user.id
          course.url  = req.upload.path
         course.id = courseId 
            let key = req.operation.courseType==="other"?'other_interactive_id':'c_interactive_id'
            objs.forEach(o=>{
              o[key] = courseId
             })
              try{
                    let test = await CoursInteractive.findByPk(courseId)
                     
                    if(test){
                      throw new ValidationError({message:'this course exists'})
                    } 
                    let c = await sails.models[req.options.model].create(course)
                    req.cours = c
                    await Obj.bulkCreate(objs)
                    return callback(null,c)
              }
             catch(e){
                 if(e instanceof ValidationError){
                  return callback(e,null)
                 }
                 else{
                  return callback(new SqlError(e),null)
                 }

              }           
          }
      },
      saveOther:(req,courseId,callback)=> {
          let course =req.body
           delete course.zipFile
          course.rating = 0
          course.addedBy = req.user.id
          course.url  = req.upload.path
         course.id = courseId 
         OtherInteractive.create(course).then(c=>{
          callback(null,c)
        }).catch(e=>{
          callback(new SqlError(e),null)
        })
     

      },
      handlexmlFile:async (req,objs,courseId,callback,fileDirectory)=>{
       
        if(courseId&&objs.length){
          return sails.services.uploadservice.saveCourse(req,objs,courseId,callback)
         }
        else{
          
          fs.readFile(path.join(fileDirectory,"tincan.xml"),async (err,chunk)=>{
            console.log('reading tincan.xml file')
            if(err){
              
              return callback(new ValidationError({message:'valid xapi course is required'}))
            }
            else{
              try{
                
              await parser.parseString(chunk,(err,result)=>{
                if(err){
                  return callback(new ValidationError({message:'valid xapi course is required'}))    
                }
                else{
                  console.log(Object.keys(result))
                    result.tincan.activities[0].activity.forEach(element => {
                    objs.push({
                        id:element.$.id,
                        type:element.$.type,
                        name:element.name[0]._,
                        description:element.name[0]._,
                        course_id:null
                    })
            
                    if(element.launch){
                    courseId =element.$.id
                    }
                  });
                  return sails.services.uploadservice.saveCourse(req,objs,courseId,callback)
                
                }
              })
                
              }
              catch(e){
                return callback(new ValidationError({message:'valid xapi course is required'}))
              }
             }
             
            })
          


          
        }


      },
      uploadFileSchema:async (req,converter)=>{
             let  {key,validation} = converter[req.options.model] 
            const ModelReference = sails.models[req.options.model]
            if(!key){
              key = "upload"
            }
            let uploadModel = {}
            Object.keys(req.body).filter(k=>k!=key).forEach(k=>{
                uploadModel[k] =req.body[k] 
            })
            const FileCreationSchema = schemaValidation(validation.create)(req.body)
            if(FileCreationSchema.isValid){
                try{
                  uploadModel.addedBy = req.user.id
                  return await ModelReference.create(uploadModel)
                }
                catch(e){
                  throw new sqlError(e)
                }
            }
            else{
                throw new ValidationError({message:FileCreationSchema.message})     
            }


      },
      updateModelWithFileUpload:async (req,converter)=>{
        let  {key,validation} = converter[req.options.model] 
        const ModelReference = sails.models[req.options.model]
        if(!key){
          key = "upload"
        }

        try{
          const model = await ModelReference.findByPk(req.params.id)
         
          let uploadModel = {}
          Object.keys(req.body).filter(k=>k!=key).forEach(k=>{
              uploadModel[k] =req.body[k] 
          })
          if(model){
            const FileUpdateSchema = schemaValidation(validation.update)(req.body)           
             if(FileUpdateSchema.isValid){
                return await model.update(uploadModel)
             }
             else{
                  throw new ValidationError({message:FileUpdateSchema.message})
             } 
          }
          else{
            throw new RecordNotFoundErr()
          }
        }
        catch(e){
            throw e
        }

      }

      










};
