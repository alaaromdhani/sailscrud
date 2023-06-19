const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');

const ValidationError = require('../../utils/errors/validationErrors');
const SqlError = require('../../utils/errors/sqlErrors');
const schemaValidation = require("../../utils/validations")
const {UpdateThemeSchema} = require('../../utils/validations/ThemeSchema');
const {UpdateCoachingVideoShema} = require('../../utils/validations/CoachingVideoSchema');

module.exports = {
  updateTheme:(req,callback)=> {
    Theme.findOne({
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
      const createThemeValidation = schemaValidation(UpdateThemeSchema)(req.body);
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
    Theme.findOne({where:{id:req.params.id},include:[{
        model:User,
        foreignKey:'addedBy',
        include:{
          model:Role,
          foreignKey:'role_id'
        }
      },{
        model:CoachingVideo,
        foreignKey:'theme_id'
    } ]}).then(theme=>{
      return new Promise((resolve,reject)=>{
        if(!theme){
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=theme.User.Role.weight && theme.addedBy!==req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot delete a theme unless it is created from a lower user or yourself'}));
        }
        if(theme.CoachingVideos && theme.CoachingVideos.length){
          return reject(new UnauthorizedError({specific:'you cannot delete a theme having some video associating with it'}));
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

  },
  update:(req,callback)=> {
    CoachingVideo.findOne({
      where: {id: req.params.id}, include: {
        model: User,
        foreignKey: 'addedBy',
        include: {
          model: Role,
          foreignKey: 'role_id'
        }
      }
    }).then(cv => {

      return new Promise((resolve, reject) => {
        if (!cv) {
          return reject(new RecordNotFoundErr());
        }
        if (req.role.weight >= cv.User.Role.weight && cv.addedBy !== req.user.id) {
          return reject(new UnauthorizedError({specific: 'you cannot update a coachingvideo unless it is created from a lower user or yourself'}));
        }
        return resolve(cv);
      });
    }).then(cv => {
      const createThemeValidation = schemaValidation(UpdateCoachingVideoShema)(req.body);
      return new Promise((resolve, reject) => {
        if (createThemeValidation.isValid) {
          return resolve(cv);
        } else {
          return reject(new ValidationError({message: createThemeValidation.message}));
        }
      });

    }).then(cv => {
      Object.keys(req.body).forEach(key => {
        cv[key] = req.body[key];

      });
      return cv.save();

    }).then(cv => {
      callback(null, cv);

    }).catch(err => {
      if (err instanceof ValidationError || err instanceof UnauthorizedError) {
        callback(err, null)
      } else {
        callback(new SqlError(err), null)
      }

    });

  },
  deleteCoachingVideo:(req,callback)=>{
    CoachingVideo.findOne({where:{id:req.params.id},include:{
        model:User,
        foreignKey:'addedBy',
        include:{
          model:Role,
          foreignKey:'role_id'
        }
      }}).then(cv=>{
      return new Promise((resolve,reject)=>{
        if(!cv){
          return reject(new RecordNotFoundErr());
        }
        if(req.role.weight>=cv.User.Role.weight && cv.addedBy!=req.user.id){
          return reject(new UnauthorizedError({specific:'you cannot delete a theme unless it is created from a lower user or yourself'}));
        }

        resolve(cv);
      });
    }).then(cv=>{
      return cv.destroy();

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
