const multer = require('multer')
const {ErrorHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const path = require('path');

const validateOptions = async (req,file,cb)=>{
  if(!req.operation){
    req.operation = {}
    req.operation.files = []
  }
  try {
    let  uploadOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{})
      uploadOptions.addedBy = req.user.id


    req.operation.files.push(uploadOptions)
    req.upload = uploadOptions
    return cb(null,true)
  }catch(e){
    req.operation.error = e
    return cb(null,false)
  }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
  },
  filename: (req, file, cb) => {

    console.log('files to upload in filename phsae')
    console.log(req.upload.file_name+'.'+req.upload.extension)
    cb(null,req.upload.file_name+'.'+req.upload.extension);
  },
});
const upload = multer({
  storage:storage,
  fileFilter:validateOptions
})
module.exports=(req,res,next)=>{
  return upload.fields([{ name: 'uploads', maxCount: 10 }])(req,res,(err)=>{
    if(!err){return next();}
    else{
      return ErrorHandlor(req,new ValidationError('the upload  field is required'),res);
    }
  });


}
