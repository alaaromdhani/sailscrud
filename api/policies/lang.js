module.exports = (req,res,next)=>{
    
    
    if(req.headers && req.headers.lang && ['en','fr','ar'].includes(req.headers.lang) ){
      
        req.setLocale(req.headers.lang)
    }
    else{
        req.setLocale('en')
    }
    return next()


}