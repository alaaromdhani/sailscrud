const jwt = require('jsonwebtoken');
const { ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage');
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const UnkownError = require('../../utils/errors/UnknownError');
const ValidationError = require('../../utils/errors/validationErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
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
    
    sails.services.passport.callback(req, res, function (err, data, info, status) {
     // sails.log.warn(data, err, info, status);
      if (err || !data) {

        if(err){
          if(err.message && !err.status){
              console.log(err)  
          }
            ErrorHandlor(req,err,res)
        }
        else{
          res.status(400).send(req.__(info.message))

        }    
      }
      else{
        if(data.token){ //be sure that login is successfull
          console.log(data)
          res.cookie('token',data.token)
          req.logIn(data.user, function(err) {
            
            if (err) {
                ErrorHandlor(req,new UnkownError(),res)
            }
            else{
              req.session.authenticated = true
              DataHandlor(req,data.user,res,'login successful')
            }
            
    
        });
        }
        else{
          DataHandlor(req,data.user,res,'registred successfully')
        }
          
          
          
      }
            

      
    });
  },
  
  logout:(req,res)=>{
    
      req.logout(async function(err) {
          if (err) {  return ErrorHandlor(req,new UnkownError(),res) }
          else{
              req.session.authenticated = false
              delete req.user
              await UserToken.update({isTokenExpired:true},{where:{token:req.cookies.token}})
              return DataHandlor(req,{},res,'logged out successfully')
          }
      });

    


  },
  forgetPassword:(req,res)=>{
   
    if(req.user){
      
        
        ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'}),res)


      }
      else{
        sails.services.userservice.sendResetPasswordNotification(req,(err,data)=>{
          if(err){
            console.log(err)
              ErrorHandlor(req,err,res)  

          }
          else{
              DataHandlor(req,{},res,"notification sent successfully")

          }




        })
        
       

          


      }



  },
  validateResetPasswordLink:(req,res)=>{
    if(req.user){
      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'},res))
    }
    else{
      sails.services.userservice.validatePasswordToken(req,(err,data)=>{
        if(err){
          ErrorHandlor(req,err,res)
        }
        else{
          DataHandlor(req,{},res,'link validated')

        }



      })


    }

  },
  resetPassword:(req,res)=>{
    if(req.user){
      ErrorHandlor(req,new UnauthorizedError({specific:'you are already connected'},res))
    }
    else{
      sails.services.userservice.resetPassword(req,(err,data)=>{
        if(err){
          ErrorHandlor(req,err,res)
        }
        else{
          DataHandlor(req,{},res,'password updated successfully')

        }



      })


    }


  },

  profileCallback:(req,res)=>{
    DataHandlor(req,req.user,res)
  },
  profileUpdater:(req,res)=>{
    if(req.file('pp')._files.length>0){
            
        sails.services.userservice.updateProfilePicture(req,(err,data)=>{
            if(err){
                ErrorHandlor(req,err,res) 
            }
            else{
              DataHandlor(req,data,res,'profile updated successfully')

            }
        })
     }
     else{
      sails.services.userservice.profileUpdater(req,(err,data)=>{
        if(err){
            ErrorHandlor(req,err,res) 
          
        }
        else{
          DataHandlor(req,data,res,'profile updated successfully')

        }
      })


     }
           


  },
  getCounteries:async (req,res)=>{
      const countries = await Country.findAll()
      DataHandlor(req,countries,res)
  },
  getStatesByCountry:async (req,res)=>{
      const {countryId} = req.params

      if(!countryId){
        ErrorHandlor(req,new ValidationError({message:'countryId is required'}),res)
      }
      else{
       const country =  await Country.findOne({where:{id:countryId},include:{
        model:State,
        foreignKey:'country_id'

       }})
         if(!country){
          ErrorHandlor(req,new RecordNotFoundErr(),res)
          
         } 
         else{
          DataHandlor(req,country,res)  
         }
      }


  },



  






}