const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const ValidationError = require('../../utils/errors/validationErrors');
const { ErrorHandlor } = require('../../utils/translateResponseMessage');

if(sails.services.Passport){

    module.exports = sails.services.passport;
}
else{
    var path = require('path');
    var url = require('url');
    var passport = require('passport');
    var _ = require('@sailshq/lodash');
    passport.protocols = require('./protocols');
    
    passport.callback = function(req,res,next){
            const provider = req.params.provider
            const action = req.params.action

            if(provider=="local"){
             
                if(action==="register"){
                    return passport.register(req.body,next)
                }
                else if(action==="dashboard"){
                  req.dash_login=true
                  return passport.authenticate('local',next)(req,res,req.next)
                }
                else if(action==="login"){
            
                  return passport.authenticate('local',next)(req,res,req.next)
                }
                else {
                  return ErrorHandlor(req,new ValidationError({message:'valid action is required'}),res)
                }
                
             
          }
          else{
              return ErrorHandlor(req,new ValidationError({message:'valid login provider is required'}),res)
          }
      };
    passport.loadStrategies = function () {
        var strategies = sails.config.passport;
       _.each(strategies, _.bind(function (strategy, key) {
           var options = {
                passReqToCallback: true
            }
            var Strategy;
            if(key=='local'){
                _.extend(options, {
                    usernameField: 'identifier'
                  });
              }
            if (strategies.local) {
                Strategy = strategies[key].strategy;
                passport.use(new Strategy(options, passport.protocols.local.login));
            }
          }))
    };
    passport.serializeUser(function (user, next) {
            next(null, user.id);
    });
  
    passport.deserializeUser(function (id, next) {
       return User.findOne({where:{id: id,isDeleted:false},include:[{
        model:Role,
        foreighKey:'role_id'
      },
      {
        model:Permission,
        through:'users_permissions',
        include:{
            model:Model,
            foreighKey:'model_id'
        }


      },{
        model:Feature,
        through:'users_features'
      }]})
        .then(function (user) {
          next(null, user || null);
          return user;
        })
        .catch(next);
  
    });
  
    
    module.exports = passport;


}