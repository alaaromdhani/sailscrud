const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const { ErrorHandlor } = require('../../utils/translateResponseMessage');

var methodMap = {
  POST: 'create',
  GET: 'read',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};


module.exports = (req,res,next)=>{

  if(req.options.model){
    req.permissions = req.user.Permissions;
    const requiredPermission = req.permissions.filter(p=>p.Model.name==req.options.model && p.action==methodMap[req.method]).at(0);
    if(requiredPermission){

      next();
    }
    else{
      const err = {specific:'you are not authorized to '+methodMap[req.method]+' the model '+req.options.model};
      ErrorHandlor(req,new UnauthorizedError(err),res);
    }


  }
  else{
   // console.log(controller)
    return next()
    
  }




};
