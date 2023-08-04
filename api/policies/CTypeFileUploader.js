const multer = require('multer');
const path = require('path');
const { PackShema, UpdatePackShema } = require('../../utils/validations/PackSchema');
const { PrepaidcardShema, UpdatePrepaidcardShema } = require('../../utils/validations/PrepaidcardSchema');
const ValidationError = require('../../utils/errors/validationErrors');
const { ErrorHandlor } = require('../../utils/translateResponseMessage');
const {  CTypeShemaWithUpload, UpdateCTypeShemaWithUpload } = require('../../utils/validations/CTypeSchema');
const fileFilerOptions = async (req,file,cb)=>{
    const modelToValidationConverter = {
      ctype:{
          validation:{create:CTypeShemaWithUpload,update:UpdateCTypeShemaWithUpload},
          key:'image',
          maxCount : 1,
          method:{
              create:sails.services.configservice.createCType,
              update:sails.services.configservice.updateCType
          },
          typeUpload:'images'
      },
      otherdocument:{
        validation:{create:CTypeShemaWithUpload,update:UpdateCTypeShemaWithUpload},
        key:'doc',
        maxCount : 1,
       method:{
            create:sails.services.otherservice.createOtherDocument,
            update:sails.services.otherservice.updateOtherDocument
        },
        typeUpload:'doc'
    },
      
  }

   if(!req.operation){
    req.operation = {}
   }
   try{

    let fileOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{type:modelToValidationConverter[req.options.model].typeUpload,isPublic:true});
      fileOptions.addedBy = req.user.id
      if(req.method=="PATCH"){
        return modelToValidationConverter[req.options.model].method.update(req,(err,data)=>{
          if(err){
            req.operation.error = err
            
            return cb(null,false)
          }
          else{
            req.operation.data = data
            req.upload = fileOptions
            return cb(null,true)
          }
        },true) 
        
      }
      else{
        modelToValidationConverter[req.options.model].method.create(req,(err,data)=>{
            if(err){
              req.operation.error = err
              return cb(null,false)
            }
            else{
              req.operation.data = data
              req.upload = fileOptions
              return cb(null,true)
            }
        },true)
      }
     
   

   }
   catch(e){
    console.log(e)
    req.operation.error = e
    return cb(null,false)
    }
     


}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('files to upload in destination')
        cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
    },
    filename: (req, file, cb) => {
        console.log('files to upload in filename phsae')
        cb(null,req.upload.file_name+'.'+req.upload.extension);
    },
})
const upload = multer({
    storage:storage,
    fileFilter:fileFilerOptions
})

module.exports = (req,res,next)=>{
  console.log('passed by here')
  let modelToValidationConverter={
    ctype:{
      key:'image',
      maxCount:1
    },
    otherdocument:{
      key:'doc',
      maxCount : 1,
    }
    }
    let {key,maxCount} = modelToValidationConverter[req.options.model]
    return upload.fields([{ name: key, maxCount: maxCount }])(req,res,(err)=>{
      if(!err){
        return next();
      }
      else{
        return ErrorHandlor(req,new ValidationError('the upload  field is required'),res);
      }
  
    });

}