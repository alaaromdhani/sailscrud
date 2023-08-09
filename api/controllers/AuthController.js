
const { ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const UnkownError = require('../../utils/errors/UnknownError');
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
const { Op } = require('sequelize');

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
  //authenticating
  callback: function (req, res) {
     
    if(req.user){
     
      return ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'}),res);
    }
    sails.services.passport.callback(req, res, (err, data, info, status) => {
      // sails.log.warn(data, err, info, status);
      if (err || !data) {
        if(err){
          if(err.message && !err.status){
            console.log(err);
          }
          return ErrorHandlor(req,err,res);
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
              let Session = sails.config.custom.database.session.store.Session
              req.session.authenticated = true;
              const activeSession = req.sessionID
              const userSessionData = '%\"passport\":{\"user\":'+data.user.id+'}%'
              await Session.destroy({
                where:{
                  data:{[Op.like]:userSessionData},
                  session_id:{[Op.ne]:activeSession}

                },
              })
              DataHandlor(req,data.user,res,'login successful');
            }
          });
        }
        else{
          req.logIn(data.user,async (err) => {
            if (err) {
              ErrorHandlor(req,new UnkownError(),res);
            }
            else{
              req.session.authenticated = true;
              DataHandlor(req,{message:data.message},res);
            }
          });
 
        }
       }
    });
  },
  activateAccount:(req,res)=>{
      sails.services.userservice.activateAccount(req,(err,data)=>{
          if(err){
            return ErrorHandlor(req,err,res)
          }
          else{
            return DataHandlor(req,data,res)
          }
      })
  },
  resendCallback:(req,res)=>{
    let type = req.params.type   
      console.log(type)
      console.log(req.user.active)
    if(type==="account_activation" && !req.user.active){
        req.operation = {type:'ACCOUNT_ACTIVATION'}
        sails.services.userservice.resendNotification(req,(err,data)=>{
            if(err){
                return ErrorHandlor(req,err,res)
            }
            else{
                return DataHandlor(req,data,res)
            }
        })
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:'a valid type is required'}),res)
    }
      
  },

  logout:(req,res)=>{
    
    req.logout(async (err) => {
      if (err) {  return ErrorHandlor(req,new UnkownError(),res); }
      else{
        const currentSession = req.sessionID
        req.session.authenticated = false;
        delete req.user;
        let Session = sails.config.custom.database.session.store.Session
        await Session.destroy({
          where:{
              session_id:currentSession

          },
        })
      
        return DataHandlor(req,{},res,'logged out successfully');
      }
    });




  },
//forget password
  forgetPassword:(req,res)=>{

    
      sails.services.userservice.forgetPassword(req,(err,data)=>{
        if(err){
          console.log(err);
          ErrorHandlor(req,err,res);

        }
        else{
          DataHandlor(req,data,res);

        }
       });
  },
  validateCode:(req,res)=>{
      sails.services.userservice.validateCode(req,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
            return DataHandlor(req,data,res)
        }
      })
    

  },
  //user profile
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
    const countries = await Country.findAll({where:{
      active:true
    }});
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
  
 










};
