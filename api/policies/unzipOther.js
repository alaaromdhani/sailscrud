const multer = require('multer');
const schemaValidation = require('../../utils/validations');
const {SoftskillsinteractiveShema} = require('../../utils/validations/SoftskillsinteractiveSchema');
const ValidationError = require('../../utils/errors/validationErrors');
const path = require('path');
const { OtherinteractiveShema } = require('../../utils/validations/OtherinteractiveSchema');
const { v4: uuidv4 } = require('uuid');


const optionsGenerator=async (req,file,cb)=>{
    if(!req.operation){
        req.operation = {}
    }
    try{
        let today = new Date()
        const destination = '../../static/other/'+today.getFullYear()+'-'+today.getMonth()+"/"+uuidv4()
        const path  = destination.split('other/').pop();
        let fileOptions = await sails.services.uploadservice.zipFileOptions(file,{type:"zipfiles",destination,path})
        let ss = {}
        Object.keys(req.body).filter(k=>k!="zipFile").forEach(k=>{
            ss[k] = req.body[k]
        })
        if(ss.parent){
            ss.parent = parseInt(ss.parent)
        }
        const createSoftSkillsValidation =schemaValidation(OtherinteractiveShema)(ss)
        if(createSoftSkillsValidation.isValid){
                req.upload =fileOptions
                console.log(req.upload)
                req.operation.data = fileOptions
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
        cb(null, path.join(__dirname,'../../static/other/'+req.upload.path));
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