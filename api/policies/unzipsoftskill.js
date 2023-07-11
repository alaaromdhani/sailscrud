const multer = require('multer');
const schemaValidation = require('../../utils/validations');
const {SoftskillsinteractiveShema} = require('../../utils/validations/SoftskillsinteractiveSchema');
const ValidationError = require('../../utils/errors/validationErrors');


const optionsGenerator=async (req,file,cb)=>{
    if(!req.operation){
        req.operation = {}
    }
    try{
        const destination = '../../static/softskills/'+today.getFullYear()+'-'+today.getMonth()+"/"+(file.originalname.split(".").shift())
        const path  = destination.split('softskills/').pop();
        let fileOptions = sails.services.uploadservice.zipFileOptions(file,{type:"zipfiles",destination,path})
        let ss = {}
        Object.keys(req.body).forEach(k=>{
            ss[k] = req.body[k]
        })
        const createSoftSkillsValidation =schemaValidation(SoftskillsinteractiveShema)(ss)
        if(createSoftSkillsValidation.isValid){
                req.operation.ss = ss
                req.operation.upload =fileOptions
                return cb(null,true)
        }
        else{
               req.operation.error=new ValidationError({message:createSoftSkillsValidation.message})     
                return cb(null,false)
        }
         

    }catch(e){
            req.operation.error = e 
            return cb(null,false)

    }   


}
const storage = multer.diskStorage({
    destination:(req,filename,cb)=>{
        cb(null, path.join(__dirname,'../../static/softskills/'+req.upload.path));
    },
    filename: (req, file, cb) => {
        cb(null,req.upload.file_name+'.'+req.upload.extension);
    },
})
const upload = multer({
storage:storage,
fileFilter:optionsGenerator,
limits:{
    fileSize:sails.config.custom.files.maxSize
}
})
module.exports = (req,res,next)=>{
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