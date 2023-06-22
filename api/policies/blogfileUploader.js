const multer = require('multer');
const path = require('path');
const {ErrorHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const {BlogShema} = require('../../utils/validations/BlogSchema');
const validationSchema = require('../../utils/validations/index')
let files = [];
let blog;
const validateOptions=async (req,file,cb)=>{

 if((file.fieldname==='mi'&&req.body.meta_img) ||(file.fieldname==='b'&&req.body.banner)){
        return cb(null,false)
 }
 else{
   if(!req.operation){
     req.operation = {};
   }
   try {
     let fileOptions = await sails.services.uploadservice.optionsGeneratorV2(file,{type:'images',isPublic:true});
      fileOptions.addedBy = req.user.id
     files.push(fileOptions);

     req.upload = fileOptions;
     if(!blog){
       let uploadId
          if(req.body.meta_img){
            req.body.meta_img =parseInt(req.body.meta_img)
            uploadId = req.body.meta_img
          }
         if(req.body.banner){
           req.body.banner = parseInt(req.body.banner)
           uploadId = req.body.banner
         }
         if(req.body.category_id && typeof (req.body.category_id)==='string'){
           req.body.category_id = parseInt(req.body.category_id)

         }
          if(uploadId){
            const upload = await Upload.findOne({where: {id:uploadId,type:'images'}})

            if(!upload){
              req.operation.error = new ValidationError({message:'type image is required'})
              return cb(null,false)
            }
          }

          let data = {}
          Object.keys(req.body).filter(k=>k!=='b'&&k!=='mi').forEach(key=>{
              data[key] = req.body[key]
          })

       const createBlogValidation = validationSchema(BlogShema)(data)
       if(createBlogValidation.isValid){
           try{
             data.status=true
             data.addedBy= req.user.id
             blog = await Blog.create(data)

             req.blog = blog

           }
           catch(e){
             console.log(e)
             req.operation.error = new SqlError(e)

             return cb(null,false)
           }
       }
       else{
          req.operation.error = new ValidationError({message:createBlogValidation.message})
          return cb(null,false)
       }

     }
     req.operation.files = files

     return cb(null,true)



   }catch (e) {

     return cb(null,false);
   }
 }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('files to upload in destination')
    cb(null, path.join(__dirname,'../../assets/'+req.upload.path));
  },
  filename: (req, file, cb) => {
    console.log('files to upload in filename phsae')
    cb(null,req.upload.file_name+'.'+req.upload.extension);
  },
});
const upload = multer({
  storage:storage,
  fileFilter:validateOptions

});
module.exports=(req,res,next)=>{
  if(files.length){
        files = []
  }
  if(blog){
      blog = undefined
  }

  return upload.fields([{ name: 'mi', maxCount: 1 },{ name: 'b', maxCount: 1 }])(req,res,(err)=>{
    if(!err){return next();}
    else{
      return ErrorHandlor(req,new ValidationError('the upload  field is required'),res);
    }
  });
};
