const UnauthorizedError = require('../../utils/errors/UnauthorizedError');

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
        var provider = req.param('provider', 'local');

        var action = req.param('action');
        console.log(action)
        if (provider === 'local' && action !== undefined) {
            
            if (action === 'register' && !req.user) {
              this.protocols.local.register(req.body,next);
            } /*else if (action === 'connect' && req.user) {
              this.protocols.local.connect(req, res, next);
            } else if (action === 'disconnect' && req.user) {
              this.protocols.local.disconnect(req, res, next);
            } */
            else {
              next(new UnauthorizedError({specific:'you are already logged in'})); 
            }
          } else {
            if (action === 'disconnect' && req.user) {
              this.disconnect(req, res, next);
            } else {
               
              // The provider will redirect the user to this URL after approval. Finish
              // the authentication process by attempting to obtain an access token. If
              // access was granted, the user will be logged in. Otherwise, authentication
              // has failed.
              this.authenticate(provider, next)(req, res, req.next);
            }
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