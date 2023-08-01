const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const { ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = async (req,res,next)=>{
     if(req.user){
                let ModelReference
                let modelName
                if(req.url.includes('coursdocuments')){
                    ModelReference = CoursDocument;
                    modelName = 'coursdocument'

                }
                if(req.url.includes('coursinteractives')){
                    ModelReference = CoursInteractive
                    modelName = 'coursinteractive'
                }
                if(req.url.includes('coursvideos')){
                    ModelReference = CoursVideo
                    modelName = 'coursvideo'
                }
                if(!req.user.Permissions.some(element=>element.Model.name===modelName&&element.action==='validate')){
                    return ErrorHandlor(req,new UnauthorizedError({specific:'you are not authorized to validate courses'}),res)
                }   
                else{
                    
                    let course = await ModelReference.findByPk(req.params.id,{
                        include:{
                            model:Course,
                            foreignKey:'parent',
                            include:{
                                model:MatiereNiveau,
                                foreignKey:'matiere_niveau_id',
                                include:[{
                                    model:User,
                                    foreignKey:'inspector',
                                    as:'Inspector',
                                    include:{
                                        model:Role,
                                        
                                    }
                                }]
    
                            }
                        }
                    })
                    console.log(!course)
                    if(!course){
                        return ErrorHandlor(req, new RecordNotFoundErr(),res)

                    }
                    else{
                        if((course.Course.MatiereNiveau.inspector!==req.user.id && course.Course.MatiereNiveau.intern_teacher!==req.user.id) && req.role.weight>=course.Course.MatiereNiveau.Inspector.Role.weight){
                            return ErrorHandlor(req,new UnauthorizedError({specific:'you are not responsible to validate this course'}),res)
                        }
                        else{
                            req.course = course
                            console.log('course')
                            return next()
                        }
                    }
                } 
     }  
     else{
        ErrorHandlor(req,new UnauthorizedError({specific:'you are not conneted'}),res)
     } 


}