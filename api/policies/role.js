
module.exports = (req,res,next)=>{
    
    
    if(req.user){
        req.role = req.user.Role
        
       return  next()
    }
    else{
       req.role={
            id:0,
            name:'public',
            weight:10000,
            Permissions:[]

       } 
       return next()

    }




}