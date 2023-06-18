const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const ValidationError = require('../../utils/errors/validationErrors');
module.exports={
  upload:(req,res)=>{
    if(req.operation && req.operation.error){
      ErrorHandlor(req,req.operation.error,res);

    }
    else if(req.upload){
      DataHandlor(req,req.upload,res)

    }
    else{
       ErrorHandlor(req,new ValidationError({message:'the file is required'}),res)
    }


  }


};
