const path = require('path');
const UnauthorizedError = require('./errors/UnauthorizedError');
const UnkownError = require('./errors/UnknownError');
const { SAPassportLockedError, BadCredentialsError } = require('./errors/lockedError');
const RecordNotFoundErr = require('./errors/recordNotFound');
const SqlError = require('./errors/sqlErrors');
const ValidationError = require('./errors/validationErrors');
/*const winston = require('winston');
const logger = winston.createLogger({
  transports: new winston.transports.File({ filename: path.join(__dirname,'../logs/sql.log') })
});*/
const translateReponseMessage = (translate,message,parameters)=>{
  if(parameters&& Array.isArray(parameters) && parameters.length>0)
  {
    parameters.unshift(message);
    return translate.apply(null,parameters);
  }
  else{
    return translate(message);
  }

};
const ErrorHandlor = (req,err,res)=>{

  if(err instanceof SAPassportLockedError){
    err.message =translateReponseMessage(req.__,err.message,err.extrafields);

    return res.status(err.status).send(err);

  }
  if(err instanceof UnauthorizedError){

    err.message =translateReponseMessage(req.__,err.message,err.extrafields);

    return res.status(err.status).send(err);
  }
  if(err instanceof SqlError){
    err.message =translateReponseMessage(req.__,err.message,err.extrafields);
    /*let errMessage = typeof(err)==='object'?JSON.stringify(err):err
    logger.log('error','sql',{message:errMessage})*/
    return res.status(err.status).send(err);

  }
  if(err instanceof ValidationError){

    err.message =translateReponseMessage(req.__,err.message,err.extrafields);

    return res.status(err.status).send(err);
  }
  if(err instanceof BadCredentialsError){

    err.message =translateReponseMessage(req.__,err.message,err.extrafields);

    return res.status(err.status).send(err);
  }
  if(err instanceof RecordNotFoundErr){
    err.message =translateReponseMessage(req.__,err.message,err.extrafields);

    return res.status(err.status).send(err);
  }
  else{
    const error = new UnkownError();
    error.message = translateReponseMessage(req.__,'some error accured come back later');
    return res.status(500).send(error);
  }



};
const DataHandlor=(req,dat,res,message,extrafields)=>{
  let data = {};
  if(!message){
    data.message = translateReponseMessage(req.__,'operation succeeded');
  }
  else{
    if(extrafields && Array.isArray(extrafields)){
      data.message = translateReponseMessage(req.__,message,extrafields);


    }else{
      data.message = translateReponseMessage(req.__,message);

    }
  }
  res.status(200).send({data:dat,message:data.message});



};

module.exports = {translateReponseMessage,ErrorHandlor,DataHandlor};
