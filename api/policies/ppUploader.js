const multer = require('multer');
const path = require('path');
const SqlError = require('../../utils/errors/sqlErrors')
const {ErrorHandlor} = require('../../utils/translateResponseMessage');
const UnkownError = require('../../utils/errors/UnknownError')
async function optionsValidator(req,file,cb){
  console.log(req.body)
  if(!req.operation){
    req.operation = {}
  }
  let fileOptions;
  try {
    fileOptions= await sails.services.uploadservice.optionsGeneratorV2(file,{isPublic:true,type:'images'});
    // eslint-disable-next-line handle-callback-err
    fileOptions.addedBy = req.user.id;
    if(req.options &&req.options.model=="user"&&req.method=="PATCH"){
        return sails.services.userservice.update(req,(err,data)=>{
          req.upload = fileOptions    
          if(err){
               
                req.operation = {error:err}
                    return cb(null,false);
              }
              else{
                req.operation = {data}
                return cb(null,true);
              }
        })
    }
    else if(req.url.includes("students")){
      if(req.body.niveau_scolaire_id){
        req.body.niveau_scolaire_id = parseInt(req.body.niveau_scolaire_id)
      }
      sails.services.studentservice.createStudent(req,(err,data)=>{
        
        req.upload = fileOptions    
        req.upload.addedBy = req.user.id
        if(err){
                  req.operation = {error:err}
                  return cb(null,false);
            }
            else{
              req.operation = {data}
              return cb(null,true);
            }
        })

    }
    else{
      return  sails.services.userservice.profileUpdater(req,async (err,data)=>{
        if(err){
          req.operation = {
            error:err
          };
          return cb(null,false);
        }
        else{
          try{
            let user = await data.save()
            let upload = await Upload.create(fileOptions)
            req.upload = upload
            user.profilePicture = upload.link
            user = await  user.save()
            req.operation = {
              data:user
            };
  
            return cb(null,true)
  
          }catch(e){
            req.operation = {
              error:new SqlError(err)
            }
            return cb(null,false)
          }
        }
      });
    }
   
  }catch(e){
    req.operation = {
      error:e
    };
    return cb(null,false);
  }

}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('file in destination')
    cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
  },
  filename: (req, file, cb) => {
    cb(null,req.upload.file_name+'.'+req.upload.extension);
  },
})
const upload = multer({
  storage:storage,
  fileFilter:optionsValidator
});
module.exports=(req,res,next)=>{
  return  upload.fields([{ name: 'pp', maxCount: 1 }])(req,res,(err)=>{
      if(err){
         return  ErrorHandlor(req,new UnkownError(),res)
      }else{
        return next()
      }


  });
};
