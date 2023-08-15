module.exports = (req,res,next)=>{
    if(req.pass){
        delete req.pass
    }
    req.pass={}
    req.pass.parentRoute = true
    return next()


}