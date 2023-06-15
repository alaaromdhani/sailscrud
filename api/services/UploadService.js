const path = require("path");
const ValidationError = require("../../utils/errors/validationErrors")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const UnkownError = require("../../utils/errors/UnknownError");
const SqlError = require("../../utils/errors/sqlErrors");

module.exports = {
    fileUploader:(req,callback)=>{
        new Promise((resolve,reject)=>{
                if(req._fileparser.upstreams.length){
                   let filename =  req._fileparser.upstreams[0]._files[0].stream.filename
                return resolve(filename)
                }
                else{
                    return reject(new ValidationError({message:'file is reaquired'}))
                }


        }).then(filename=>{
            let options ={}
            
              return new Promise((resolve,reject)=>{
                const extension = filename.split('.').pop()
                const allowedExtentions = sails.config.custom.files.extensions
                const type = Object.keys(allowedExtentions).filter(key=>allowedExtentions[key].includes(extension)).at(0)
                if(type){
                    options.file_original_name= filename
                    options.file_name =  uuidv4()
                    options.type = type
                    options.extension =extension
                    const currentDate = new Date()
                    const  currentDirName = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)
                    options.assetsDir = path.join(__dirname,'../../assets/uploads/lib/'+currentDirName)
                    options.path = 'uploads/lib/'+currentDirName
                    options.dirname =options.assetsDir
                    options.saveAs = options.file_name+'.'+extension 
                    options.uploadParameter="upload"
                    return resolve(options)
                
                }   
                else{
                      return reject(new ValidationError({message:'extention is required'}))  

                }    

              })
              
        
        }).then(options=>{
               sails.services.uploadservice.updateFile(req,options,callback)              
        }).catch(err=>{
            callback(err,null)
        })
        
       

    },
    updateFile:(req,options,callback)=>{
            console.log(options)
            let isPublic = options.isPublic?true:false
            let uploadParameter = options.uploadParameter?options.uploadParameter:"upload"    
            
            fs.mkdir(options.assetsDir,{recursive:true},(err)=>{
                    if(err){
                        callback(new UnkownError(),null)
                    }
                            
                    else{
                                const {saveAs,dirname} = options
                                req.file(uploadParameter).upload({dirname,saveAs},async (err,upoadedFiles)=>{
                                    if(err){

                                        console.log(err)
                                        callback(new UnkownError(),null)

                                    }
                                    else{
                                            const {file_original_name,file_name,type,extension,path} = options
                                            let link = sails.config.custom.baseUrl+''+file_name
                                             let addedBy = req.user.id   
                                            let file_size;
                                            try{
                                                file_size=upoadedFiles[0].size
                                            }catch(e){
                                                file_size=124
                                            }

                                            
                                            try{

                                            callback(null,await Upload.create({file_original_name,file_name,type,extension,file_size,path,link,isPublic,addedBy}))
                                        }
                                        catch(e){
                                            callback(new SqlError(e),null)   

                                        }
                                    }


                                })

                           
                    }
            })
    },
    optionGenerator:(req,isPublic,dirname,uploadParameter)=>{
        let filename
        
        return new Promise((resolve,reject)=>{
                try{
                    filename =  req._fileparser.upstreams[0]._files[0].stream.filename
                    if(!dirname){
                            dirname = "uploads/lib/"             
                    }
                    let options ={}
                    
                    
                    const extension = filename.split('.').pop()
                    const allowedExtentions = sails.config.custom.files.extensions
                    const type = Object.keys(allowedExtentions).filter(key=>allowedExtentions[key].includes(extension)).at(0)
                    if(type){
                        options.file_original_name= filename
                        console.log(filename)
                        options.file_name =  uuidv4()
                        options.type = type
                        options.extension =extension
                        const currentDate = new Date()
                        const  currentDirName = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)
                        options.assetsDir = path.join(__dirname,'../../assets/'+dirname+currentDirName)
                        options.path = dirname+currentDirName
                        options.dirname =options.assetsDir
                        options.saveAs = options.file_name+'.'+extension 
                        options.uploadParameter=uploadParameter?uploadParameter:"upload"
                        options.isPublic =isPublic
                        return resolve(options)
                    
                    }   
                    else{
                            return reject(new ValidationError({message:'extention is required'}))  

                    }    
            }catch(e){
                return reject(new ValidationError({message:'file is required'}))
            }
        })
    },
    








}