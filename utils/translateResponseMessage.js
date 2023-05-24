const UnauthorizedError = require("./errors/UnauthorizedError")
const { SAPassportLockedError, BadCredentialsError } = require("./errors/lockedError")
const SqlError = require("./errors/sqlErrors")
const ValidationError = require("./errors/validationErrors")

const translateReponseMessage = (translate,message,parameters)=>{
    if(parameters&& Array.isArray(parameters) && parameters.length>0)
    {   
        parameters.unshift(message)
        return translate.apply(null,parameters)
    }
    else{
        return translate(message)
    }

}
const ErrorHandlor = (req,err,res)=>{
    if(err instanceof SAPassportLockedError){
        return res.status(err.status).send(translateReponseMessage(req.__,err.message,err.extrafields))

    }
    if(err instanceof UnauthorizedError){

        return res.status(err.status).send(translateReponseMessage(req.__,err.message))
    }
    if(err instanceof SqlError){
        
        return res.status(err.status).send(translateReponseMessage(req.__,err.message,err.extrafields))
        
    }
    if(err instanceof ValidationError){

        return res.status(err.status).send(translateReponseMessage(req.__,err.message,err.extrafields))
    }
    if(err instanceof BadCredentialsError){

        return res.status(err.status).send(translateReponseMessage(req.__,err.message))
    }
    else{
        return res.status(500).send(translateReponseMessage(req.__,'some error accured come back later'))
    }



}
module.exports = {translateReponseMessage,ErrorHandlor}