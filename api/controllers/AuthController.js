
const { ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const UnkownError = require('../../utils/errors/UnknownError');
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors')
module.exports = {

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    if(req.user){


      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'}),res);


    }
    sails.services.passport.callback(req, res, (err, data, info, status) => {
      // sails.log.warn(data, err, info, status);
      if (err || !data) {

        if(err){
          if(err.message && !err.status){
            console.log(err);
          }
          ErrorHandlor(req,err,res);
        }
        else{
          res.status(400).send(req.__(info.message));

        }
      }
      else{
        if(data.authetication){ //be sure that login is successfull
          
          
          req.logIn(data.user,async (err) => {

            if (err) {
              ErrorHandlor(req,new UnkownError(),res);
            }
            else{
              req.session.authenticated = true;
              const activeSession = "'"+req.sessionID+"'"
              const userSessionData = '%\"passport\":{\"user\":'+data.user.id+'}%'
              await User.sequelize.query(`delete  FROM sessions WHERE data like '${userSessionData}' and session_id!=${activeSession} `);
              
              
              DataHandlor(req,data.user,res,'login successful');
            }


          });
        }
        else{
          DataHandlor(req,data.user,res,'registred successfully');
        }



      }



    });
  },

  logout:(req,res)=>{

    req.logout(async (err) => {
      if (err) {  return ErrorHandlor(req,new UnkownError(),res); }
      else{
        const currentSession = req.sessionID
        req.session.authenticated = false;
        delete req.user;
        
        await User.sequelize.query(`delete  FROM sessions WHERE session_id ='${currentSession}'`);
      
        return DataHandlor(req,{},res,'logged out successfully');
      }
    });




  },
  forgetPassword:(req,res)=>{

    if(req.user){


      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'}),res);


    }
    else{
      sails.services.userservice.sendResetPasswordNotification(req,(err,data)=>{
        if(err){
          console.log(err);
          ErrorHandlor(req,err,res);

        }
        else{
          DataHandlor(req,{},res,'notification sent successfully');

        }




      });






    }



  },
  validateResetPasswordLink:(req,res)=>{
    if(req.user){
      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'},res));
    }
    else{
      sails.services.userservice.validatePasswordToken(req,(err,data)=>{
        if(err){
          ErrorHandlor(req,err,res);
        }
        else{
          DataHandlor(req,{},res,'link validated');

        }



      });


    }

  },
  resetPassword:(req,res)=>{
    if(req.user){
      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'},res));
    }
    else{
      sails.services.userservice.resetPassword(req,(err,data)=>{
        if(err){
          ErrorHandlor(req,err,res);
        }
        else{
          DataHandlor(req,{},res,'password updated successfully');

        }



      });


    }


  },

  profileCallback:(req,res)=>{
    DataHandlor(req,req.user,res);
  },
  profileUpdater:(req,res)=>{
    if(req.operation){
      if(req.operation.data){
            return DataHandlor(req,req.operation.data,res)
      }
      else{
        return ErrorHandlor(req,req.operation.error,res)
      }
    }
    else{
        if(req.files && req.files.length){
          return ErrorHandlor(req,new UnkownError(),res)
        }
        else{
          sails.services.userservice.profileUpdater(req,async (err,data)=>{
              if(err){
                return ErrorHandlor(req,err,res)
              }
              else{
                  try{
                    return DataHandlor(req,await data.save(),res)
                  }
                  catch(e){
                    return ErrorHandlor(req,new SqlError(e),res)

                  }
              }
          })
        }
    }



  },
  getCounteries:async (req,res)=>{
    const countries = await Country.findAll();
    DataHandlor(req,countries,res);
  },
  getStatesByCountry:async (req,res)=>{
    const {countryId} = req.params;

    if(!countryId){
      ErrorHandlor(req,new ValidationError({message:'countryId is required'}),res);
    }
    else{
      const country =  await Country.findOne({where:{id:countryId},include:{
        model:State,
        foreignKey:'country_id'

      }});
      if(!country){
        ErrorHandlor(req,new RecordNotFoundErr(),res);

      }
      else{
        DataHandlor(req,country,res);
      }
    }


  },
  getActiveSessions:async (req,res)=>{
    if(req.user){
        const data = '%\"passport\":{\"user\":'+req.user.id+'}%'
        const openedSessions = await User.sequelize.query(`delete  FROM sessions WHERE data like '${data}' `);
       
        return DataHandlor(req,openedSessions,res)
    }
    else{
      return ErrorHandlor(req,new UnauthorizedError(),res)
    }
  }










};
