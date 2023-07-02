const multer = require('multer')
const { ErrorHandlor } = require('../../utils/translateResponseMessage')
const ValidationError = require('../../utils/errors/validationErrors')
const optionsValidator = async (req,file,cb)=>{
   if(!req.operation){
    req.operation={}
   }
   try{
        let fileOptions = await sails.services.uploadservice.zipFileOptions(file,{type:"zipFiles"})
        req.upload =fileOptions
        req.operation.data = fileOptions
        return cb(null,true)
   }catch(e){
        req.operation.error = e
       return cb(null,false)
    } 
}
const storage = multer.diskStorage({
   destination:(req,filename,cb)=>{
    cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
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
    return upload.fields([{
        name:'zipFile',
        maxCount:1
    }])(req,res,(err)=>{
        if(!err){
            return next()
        }
        else{
            return ErrorHandlor(req,new ValidationError({message:'zipFile is required'}))
        }
    })

}