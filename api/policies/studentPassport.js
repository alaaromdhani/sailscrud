module.exports = (req,res,next)=>{
    console.log('maaaan')
    if(req.pass){
        delete req.pass
    }
    req.pass={}
    req.pass.studentRoute = true
    return next()

}