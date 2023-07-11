const UnauthorizedError = require("../../utils/errors/UnauthorizedError");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor } = require("../../utils/translateResponseMessage");

module.exports = (req,res,next)=>{
    var methodMap = {
        POST: 'create',
        GET: 'read',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete'
      };
        const type = req.query.type?req.query.type:"interactive"
        let modelName
        if(type=="interactive"){
             modelName ="softskillsinteractive"   
        }
        if(type=="document"){
            modelName ="softskillsdocument"
        }
        if(type=="video"){
            modelName ="softskillsvideo"
        }
        if(modelName){
            const requiredPermission = req.user.Permissions.filter(p=>p.Model.name==modelName && p.action==methodMap[req.method]).at(0);
            if(requiredPermission){
        
                return next();
            }
            else{
            const err = {specific:'you are not authorized to '+methodMap[req.method]+' the model '+req.options.model};
                return ErrorHandlor(req,new UnauthorizedError(err),res);
            }
        }
        return ErrorHandlor(req,new ValidationError({message:'a valid type is required'}),res)
    




}