const recordNotFoundErr = require('../../utils/errors/recordNotFound');
const unauthorizedErr = require('../../utils/errors/UnauthorizedError');
module.exports = {
      deleteNiveauScolaire:(req,callback)=>{
        NiveauScolaire.findByPk(req.params.id,{
            include:{
              model:Course,
              foreignKey:'matiere_id'
            }
          }).then(m=>{
            return new Promise((resolve, reject) => {
              if(!m){
                return reject(new recordNotFoundErr())
              }
              else if(m.Courses && m.Courses.length ){
                return reject(new unauthorizedErr())
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
            callback(e,null)
          })
      }
}
