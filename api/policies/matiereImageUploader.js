const multer = require('multer');
const path = require('path');
const ValidationError = require('../../utils/errors/validationErrors');
const fileFilerOptions = async (req,file,cb)=>{
    console.log('wowowow')
    try{
        if(!req.operation){
            req.operation = {}
        }
        if(req.body.domaine_id){
            req.body.domaine_id = parseInt(req.body.domaine_id)
        }
        if(req.body.ns){
            req.body.ns = JSON.parse(req.body.ns)
        }
        let fileOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{type:'images',isPublic:true});
        fileOptions.addedBy = req.user.id    
        req.upload = fileOptions
        let bodyData = {}
        Object.keys(req.body).filter(k=>k!=="img").forEach(k=>{
            bodyData[k] = req.body[k]
        })
        if(req.method=="PATCH"){
            const m = await Matiere.findByPk(req.params.id)
          
            sails.services.matiereservice.updateMatiere(req,bodyData,(err,data)=>{
                if(err){
                    req.operation.error = err
                    return cb(null,false)
                }
                else{
                    req.operation.model = m
                    return cb(null,true)
                }
            },true)
        }
        else{
           
                sails.services.matiereservice.createMatiere(req,bodyData,(err,data)=>{
                    if(err){
                        req.operation.error = err
                        return cb(null,false)
                    }
                    else{
                        req.operation.model = data
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
    return upload.fields([{ name: 'img', maxCount: 1 }])(req,res,(err)=>{
        if(!err){
          return next();
        }
        else{
          return ErrorHandlor(req,new ValidationError('the upload  field is required'),res);
        }
    
      });

}
