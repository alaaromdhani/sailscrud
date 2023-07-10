const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors')

module.exports={
  getChildren:async (req,res)=>{
    console.log(req.params.id)
    res.status(200).send("hhhh")
  },
 /* getChildren:(req,res)=>{
      res.status
  },*/
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
