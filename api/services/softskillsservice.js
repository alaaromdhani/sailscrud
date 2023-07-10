const schemaValidation = require("../../utils/validations");
const { UpdateSoftskillsthemeShema } = require("../../utils/validations/SoftskillsthemeSchema");

module.exports={
    updateTheme:(req,callback)=> {
        SoftSkillsTheme.findOne({
          where: {id: req.params.id}, include: {
            model: User,
            foreignKey: 'addedBy',
            include: {
              model: Role,
              foreignKey: 'role_id'
            }
          }
        }).then(theme => {
    
          return new Promise((resolve, reject) => {
            if (!theme) {
              return reject(new RecordNotFoundErr());
            }
            if (req.role.weight >= theme.User.Role.weight && theme.addedBy !== req.user.id) {
              return reject(new UnauthorizedError({specific: 'you cannot update a role unless it is created from a lower user or yourself'}));
            }
            return resolve(theme);
          });
        }).then(theme => {
          const createThemeValidation = schemaValidation(UpdateSoftskillsthemeShema)(req.body);
          return new Promise((resolve, reject) => {
            if (createThemeValidation.isValid) {
              return resolve(theme);
            } else {
              return reject(new ValidationError({message: createThemeValidation.message}));
            }
          });
    
        }).then(theme => {
          Object.keys(req.body).forEach(key => {
            theme[key] = req.body[key];
    
          });
          return theme.save();
    
        }).then(theme => {
          callback(null, theme);
    
        }).catch(err => {
          if (err instanceof ValidationError || err instanceof UnauthorizedError) {
            callback(err, null)
          } else {
            callback(new SqlError(err), null)
          }
    
        });
    
      },
      deleteTheme:(req,callback)=>{
        SoftSkillsTheme.findOne({where:{id:req.params.id},include:[{
            model:User,
            foreignKey:'addedBy',
            include:{
              model:Role,
              foreignKey:'role_id'
            }
          } 
        ]}).then(theme=>{
          return new Promise((resolve,reject)=>{
            if(!theme){
              return reject(new RecordNotFoundErr());
            }
            if(req.role.weight>=theme.User.Role.weight && theme.addedBy!==req.user.id){
              return reject(new UnauthorizedError({specific:'you cannot delete a theme unless it is created from a lower user or yourself'}));
            }
         
            resolve(theme);
          });
        }).then(theme=>{
          return theme.destroy();
    
        }).then(somedata=>{
          callback(null,{});
    
        }).catch(err=>{
          if (err instanceof ValidationError || err instanceof UnauthorizedError) {
            callback(err, null)
          } else {
            callback(new SqlError(err), null)
          }
        });
    
      }




}