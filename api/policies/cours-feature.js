const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports =(req,res,next)=>{
    req.courses={};
    (req.user.Features.filter(f=>f.name==="course Access").at(0))?req.courses.private=true:req.courses.private=false
    return next()
}