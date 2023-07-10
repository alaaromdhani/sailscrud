module.exports=async (req,res,next)=>{

const requiredPermission = req.user.Permissions.filter(p=>p.Model.name=="course" && p.action=="read").at(0);
    if(requiredPermission){

      next();
    }
    else{
      const err = {specific:'you are not authorized to '+methodMap[req.method]+' the model '+req.options.model};
      ErrorHandlor(req,new UnauthorizedError(err),res);
    }

}