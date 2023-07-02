const path = require('path');
const ValidationError = require('../../utils/errors/validationErrors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const UnkownError = require('../../utils/errors/UnknownError');
const SqlError = require('../../utils/errors/sqlErrors');
const {DataTypes} = require('sequelize');
const yauzl = require("yauzl")

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
        parameter.destination = '../../assets/uploads/'+today.getFullYear()+'-'+today.getMonth()+"/"+file.originalname.split(".").shift()
      }
      const type = Object.keys(sails.config.custom.files.extensions).filter(ext=>sails.config.custom.files.extensions[ext].map(item=>item.toLowerCase()).includes(extention.toLowerCase())).at(0);
      if(!type){
        return reject(new ValidationError({message:'a valid type is required'}));
      }
      if(parameter.type &&  parameter.type!==type){
        return reject(new ValidationError({message:'a file with type '+parameter.type+" is required"}))
      }
      options.file_original_name = file.originalname;
     // options.isPublic=typeof (parameter.isPublic)==='boolean'?options.isPublic=parameter.isPublic:false;
      options.path=parameter.destination.split('assets/').pop();
    //  options.file_name=uuidv4();
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
  zipFileUploader:(req,callback)=>{
      if(req.operation){
          if(req.operation.error){
              callback(req.operation.error,null)
          } 
          else{
            const upload = req.operation.data
               yauzl.open(path.join("../../assets/",upload.path))      
          
          
          } 
      }
      else{
        callback(new ValidationError({message:'zipfile is required'}),null)
      }
    }










};
