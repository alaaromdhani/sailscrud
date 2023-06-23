const {UpdateCourseShema} = require('../../utils/validations/CourseSchema');
const schemaValidation = require('../../utils/validations')
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound')
const UnauthorizedErr = require('../../utils/errors/UnauthorizedError')
const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
module.exports = {
    createCourse:()=>{


      },
    updateCourse:(req,callback)=>{
        const updateCourseSchema = schemaValidation(UpdateCourseShema)(req.body)
        new Promise((resolve,reject)=>{
          if(updateCourseSchema.isValid){
              return resolve(req.body)
          }
          else{
              return reject(new ValidationError({message:updateCourseSchema.message}))
          }
        }).then(course=>{
              return Course.findOne({
                where:{
                  id:req.params.id
                },
                include:{
                  model:User,
                  foreignKey:'addedBy',
                  include:{
                    model:Role,
                    foreignKey: 'role_id'
                  }
                }
              })
        }).then(course=>{
            return new Promise((resolve, reject) => {
              if(!course){
                return reject(new RecordNotFoundErr())
              }
              else if(course.User.Role.weight<=req.role.weight && course.addedBy!=req.user.id){
                return reject(new UnauthorizedErr({specific:'you cannot update a course created by a user higher than you'}))
              }
              else{
                 return resolve(course)
              }
            })
        }).then(course=>{
              Object.keys(req.body).forEach(k=>{

                course[k] = req.body[k]

              })
              return course.save()
        }).then(course=>{
              callback(null,course)
        }).catch(err=>{
          if(err instanceof ValidationError || err instanceof recordNotFoundErr || err instanceof SqlError){
            callback(err,null)
          }
          else{
            callback(new SqlError(err),null)
          }
        })

    }



}
