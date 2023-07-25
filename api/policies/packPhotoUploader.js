const multer = require('multer');
const path = require('path');
const { PackShema, UpdatePackShema } = require('../../utils/validations/PackSchema');
const { PrepaidcardShema, UpdatePrepaidcardShema } = require('../../utils/validations/PrepaidcardSchema');
const ValidationError = require('../../utils/errors/validationErrors');
const { ErrorHandlor } = require('../../utils/translateResponseMessage');
const modelToValidationConverter = {
        pack:{
            validation:{create:PackShema,update:UpdatePackShema},
            key:'image',
            maxCount : 1
        },
        prepaidcard:{
            validation:{create:PrepaidcardShema,update:UpdatePrepaidcardShema},
            key:'image',
            maxCount : 1
        }
}
const fileFilerOptions = async (req,file,cb)=>{
   if(!req.operation){
    req.operation = {}
   }
   try{
    if(req.body.price){
        req.body.price = parseFloat(req.body.price)
     }
     if(req.body.duration){
        req.body.duration = parseInt(req.body.duration)
    }
    
    if(req.body.pack_id){
      req.body.pack_id = parseInt(req.body.pack_id)
    }
    if(req.body.photo){
      req.body.photo = parseInt(req.body.photo)
    }
    if(req.body.nbre_cards){
        req.body.nbre_cards = parseInt(req.body.nbre_cards)
      }
    let fileOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{type:'images',isPublic:true});
      let model
      if(req.method=="PATCH"){
        return sails.services.payementservice.updatemodel(req,(err,data)=>{
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
        model =  await sails.services.uploadservice.uploadFileSchema(req,modelToValidationConverter);
        req.operation.data = model
        req.upload = fileOptions
        return cb(null,true)
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