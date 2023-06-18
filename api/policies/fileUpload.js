const multer = require('multer');
const path = require('path');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const UnkonwnError = require('../../utils/errors/UnknownError');
const {ErrorHandlor} = require('../../utils/translateResponseMessage');

const validateOptions=async (req,file, cb)=>{
  let fileOptions;
  try{
    fileOptions= await sails.services.uploadservice.optionsGeneratorV2(file,{isPublic:false});
    fileOptions.addedBy = req.user.id;
    Upload.create(fileOptions).then(upload=>{
      req.upload = upload;
      return cb(null,true);
    }).catch(err=>{

      req.operation={
        error:new SqlError(err)
      };
      return cb(null,false);

    });
  }
  catch(e){
    req.operation={
      error:e
    };

    return cb(null,false);
  }

};
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
  },
  filename: (req, file, cb) => {
    cb(null,req.upload.file_name+'.'+req.upload.extension);
  },


});
const upload = multer({
  storage:storage,
  fileFilter:validateOptions

});
module.exports=(req,res,next)=>{
  console.log('hello file upload policy');
  return upload.fields([{ name: 'upload', maxCount: 1 }])(req,res,(err)=>{
    if(!err){
      return next();
    }
    else{
      return ErrorHandlor(req,new ValidationError('the upload  field is required'),res);
    }

  });
};
