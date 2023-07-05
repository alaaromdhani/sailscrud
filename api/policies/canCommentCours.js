module.exports=(req,res,next)=>{
    req.permissions = req.user.Permissions
    const requiredPermission = req.permissions.filter(p=>p.Model.name=='courscomment' && p.action=='create').at(0);
    if(requiredPermission){
        next();
    }
    else{
      const err = {specific:'you are not authorized to add a comment'};
      ErrorHandlor(req,new UnauthorizedError(err),res);
    }
}