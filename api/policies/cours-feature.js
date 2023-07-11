const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports =(req,res,next)=>{
    const urlFeature = {
          "cours":"course Access" ,
          "softskills":"softskills Access" 

    }
    let feature
    Object.keys(urlFeature).forEach(k=>{
        if(req.url.includes(k)){
            feature = urlFeature[k]
        }
    })
    if(feature){
        req.courses={};
        (req.user.Features.filter(f=>f.name==="course Access").at(0))?req.courses.private=true:req.courses.private=false
        return next()
    }
    else{
        return res.send(404)
    }
  
}