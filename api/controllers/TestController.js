const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors')
const UnkonwnError = require('../../utils/errors/UnknownError')
const path = require('path');
const fs = require('fs');
const {dirname} = require('path');
module.exports={
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
