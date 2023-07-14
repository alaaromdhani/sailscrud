const {UpdateCourseShema, CourseShema} = require('../../utils/validations/CourseSchema');
const schemaValidation = require('../../utils/validations')
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound')
const UnauthorizedErr = require('../../utils/errors/UnauthorizedError')
const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
module.exports = {
    createCourse:(req,callback)=>{
          
          new Promise((resolve,reject)=>{
              const createCourseValidation = schemaValidation(CourseShema)(req.body)
              if(createCourseValidation.isValid){
                  return resolve(req.body)
              }
              else{
                  return reject(new ValidationError({message:createCourseValidation.message}))
              }
            }).then(course=>{
                  return MatiereNiveau.findOne({where:{
                      MatiereId:course.matiere_id,
                      NiveauScolaireId:course.niveau_scolaire_id
                    },include:{
                        model:Module,
                        foreignKey:'module_id',
                        attributes:['id']
                      }})
                  
              }).then(matiere_niveau=>{
                return new Promise((resolve,reject)=>{
                  if(matiere_niveau){
                      if(matiere_niveau.Modules.map(m=>m.id).includes(req.module_id)){
                        resolve(req.body)
                      }
                      else{
                        reject(new ValidationError('the module is not related to the subject and the level'))
                      }
                  }
                  else{
                      return reject(new ValidationError({message:'the relation between the subject and the level  must be done'})) 
                  }
                })
              }).then(c=>{
                c.addedBy = req.user.id
                c.rating = 0
                return Course.create(c)
              }).then(c=>{
                  callback(null,c)
              }).catch(e=>{
                if(e instanceof ValidationError){
                  callback(e,null)
                }
                else{
                  callback(new SqlError(e),null)
                }



              })
            /*
              try {
                  let  courseToCreate = req.body
                  const data = await Course.create(courseToCreate);
                  return DataHandlor(req,data,res)
                } catch (err) {
                  return ErrorHandlor(req,new SqlError(err),res);
                }
            */

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
