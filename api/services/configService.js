const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const unauthorizedErr = require('../../utils/errors/UnauthorizedError');
const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
module.exports = {
      deleteNiveauScolaire:(req,callback)=>{
        NiveauScolaire.findByPk(req.params.id,{
            include:{
              model:Course,
              foreignKey:'niveau_scolaire_id'
            }
          }).then(m=>{
            return new Promise((resolve, reject) => {
              if(!m){
                return reject(new recordNotFoundErr())
              }
              else if(m.Courses && m.Courses.length ){
                return reject(new unauthorizedErr({specific:'you cannot delete a record with type niveauscolaire with attributed courses'}))
              }
              else{
                return resolve(m)
              }
            })
          }).then(m=>{
            return m.destroy()
          }).then(sd=>{
            callback(null,{})
          }).catch(e=>{
                if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
                  callback(e,null)
                }
                else{
                  callback(new SqlError(e),null)
                }
          })
      },
  deleteChapitre:(req,callback)=>{
    Chapitre.findByPk(req.params.id,{
      include:{
        model:Course,
        foreignKey:'chapitre_id'
      }
    }).then(m=>{
      return new Promise((resolve, reject) => {
        if(!m){
          return reject(new recordNotFoundErr())
        }
        else if(m.Courses && m.Courses.length ){
          return reject(new unauthorizedErr({specific:'you cannot delete a record with type chapitres with attributed courses'}))
        }
        else{
          return resolve(m)
        }
      })
    }).then(m=>{
      return m.destroy()
    }).then(sd=>{
      callback(null,{})
    }).catch(e=>{
      if(e instanceof ValidationError || e instanceof recordNotFoundErr || e instanceof SqlError || e instanceof unauthorizedErr){
        callback(e,null)
      }
      else{
        callback(new SqlError(e),null)
      }
    })
  }
}
