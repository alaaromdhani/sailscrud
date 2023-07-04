const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors')

module.exports={
  accessCourse:(req,res)=>{
    res.header({'Content-Security-Policy': "frame-ancestors *"})
    res.view('pages/homepage.ejs')
  },
  upload:async (req,res)=>{
   if(req.operation){
     if(req.operation.files && req.operation.files.length ){
       try{
         return DataHandlor(req,await Upload.bulkCreate(req.operation.files,{
           individualHooks:true
         }),res )
       } catch(e){
         console.log(e)
         return ErrorHandlor(req,new SqlError(e),res)
       }
     }
     else {
       return ErrorHandlor(req,req.operation.files,res)
     }
   }
   else{
      return ErrorHandlor(req,new ValidationError({message:'uploads is required'}),res)
   }


  }


};
