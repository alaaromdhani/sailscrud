const multer = require('multer')
const { ErrorHandlor } = require('../../utils/translateResponseMessage')
const ValidationError = require('../../utils/errors/validationErrors')
const path = require('path')
const schemaValidation = require('../../utils/validations')
const { CoursInteractiveShema } = require('../../utils/validations/CoursInteractiveSchema')
const optionsValidator = async (req,file,cb)=>{
   if(!req.operation){
    req.operation={}
   }
   try{
        let fileOptions = await sails.services.uploadservice.zipFileOptions(file,{type:"zipfiles"})
        if(req.body.parent){
            req.body.parent = parseInt(req.body.parent)   
        }
        let course = {}
        Object.keys(req.body).filter(k=>k!='zipFile').forEach(k=>{
                course[k] = req.body[k]
         })
         console.log("request body",req.body)
        const coursIntercativeValidation = schemaValidation(CoursInteractiveShema)(course)
          if(coursIntercativeValidation.isValid){
            req.upload =fileOptions
            req.operation.data = fileOptions
            return cb(null,true) 
          }
         else{
            req.operation.error = new ValidationError({message:coursIntercativeValidation.message})
            return cb(null,false)
          }
        
   }catch(e){
        req.operation.error = e
       return cb(null,false)
    } 
}
const storage = multer.diskStorage({
   destination:(req,filename,cb)=>{
        cb(null, path.join(__dirname,'../../static/courses/'+req.upload.path));
    },
    filename: (req, file, cb) => {
        cb(null,req.upload.file_name+'.'+req.upload.extension);
    },
})   
const upload = multer({
    fileFilter:optionsValidator,
    storage:storage,
    limits:{
        fileSize:sails.config.custom.files.maxSize
    }
}) 
module.exports=(req,res,next)=>{
    console.log("file is uploading")
    return upload.fields([{
        name:'zipFile',
        maxCount:1
    }])(req,res,(err)=>{
        if(!err){
            return next()
        }
        else{
            return ErrorHandlor(req,new ValidationError({message:'zipFile is required'}),res)
        }
    })

}