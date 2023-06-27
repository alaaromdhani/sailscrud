const multer = require('multer');
const schemaValidation = require('../../utils/validations');
const { CoursDocumentShema } = require('../../utils/validations/CoursdocumentSchema');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const optionsVerifier= async (req,file,cb)=>{
    if(!req.operation){
         req.operation = {}   
    }
    if((file.fieldname==='mi'&&req.body.meta_img) ||(file.fieldname==='b'&&req.body.banner)){
        return cb(null,false)
    }
    try{
        let uploadOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{type:'doc',isPublic:true});
        let coursDocument ={}
        
        Object.keys(req.body).filter(k=>k!='doc').forEach(k=>{
            coursDocument[k] = req.body[k]
        })
        try{
            const createDocCoursValidation = schemaValidation(CoursDocumentShema)(coursDocument)
            if(createDocCoursValidation.isValid){
                 coursDocument.addedBy = req.user.id   
                const createdCourse = await CoursDocument.create(coursDocument)    
                req.operation.data=createdCourse    
                req.upload = uploadOptions
                req.upload.addedBy = req.user.id
                return cb(null,true)
            }
            else{
                req.operation={
                    error:new ValidationError({message:createDocCoursValidation.message})
                }
                return cb(null,false)
            }

        }catch(e){
            req.operation={
                error:new SqlError(e)
            }
            return cb(null,false)
        }

        
    }
    catch(e){
        req.operation={
            err:e
        }
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
const upload  = multer({
    fileFilter:optionsVerifier
})
module.exports =(req,res,next)=>{

    return upload.fields([{ name: 'doc', maxCount: 1 }])(req,res,(err)=>{
        if(!err){return next();}
        else{
          return ErrorHandlor(req,new ValidationError('the document field is required'),res);
        }
      });

}


