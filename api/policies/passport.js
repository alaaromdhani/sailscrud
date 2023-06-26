module.exports = (req,res,next)=>{

    const passport = sails.services.passport


    passport.initialize()(req, res, function () {

        // Use the built-in sessions
        passport.session()(req, res, function () {


                next()

        });
      });



}
