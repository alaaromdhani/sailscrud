const { UniqueConstraintError } = require("sequelize");
const { BadCredentialsError } = require("../../../utils/errors/lockedError");
const generateToken = require("../../../utils/generateToken");
const schemaValidation = require("../../../utils/validations");
const {UserShema, registerSchema} = require("../../../utils/validations/UserSchema");
const SqlError = require("../../../utils/errors/sqlErrors");
const ValidationError = require("../../../utils/errors/validationErrors");
const {Op} = require('sequelize');
const dayjs = require("dayjs");
const generateCode = require("../../../utils/generateCode");
const { v4: uuidv4 } = require('uuid');


/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
let phoneregex = /^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
/**
 * Use validator module isEmail function
 *
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L38>
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L141-L143>
 */
function validateEmail (str) {
  return EMAIL_REGEX.test(str);
}


exports.register = function (user,callback){
    const  createUserValidation = schemaValidation(registerSchema)
    const validationRequest = createUserValidation(user)
    if(validationRequest.isValid){
        let createdUser
        let generatedNumber
        let notification
        let permissions
        let role_name
        if(user.role=='parent'){
          role_name = sails.config.custom.roles.parent.name              
        }
        if(user.role=='teacher'){
          role_name = sails.config.custom.roles.teacher.name              
        }
        if(!role_name){
          return callback(new ValidationError({message:'a valid role name is required'}))
        }
        
        //countryvalidation must come first 
        State.findByPk(user.state_id,{include:{
            model:Country,
            foreignKey:'country_id'
        }}).then(s=>{
          return new Promise((resolve,reject)=>{
            //validating the country and the state

              if(s && s.active && s.Country && s.country_id==user.country_id  && s.Country.active){
                //validating the phonenumber is related to the country 
                let tel_code = s.Country.tel_code.startsWith('+')?s.Country.tel_code.substring(1):s.Country.tel_code
                 if(!user.phonenumber.startsWith(tel_code)){
                  return reject(new ValidationError({message:'a valid phonenumber is required'}))
                 } 
                user.phonenumber = '+'+user.phonenumber
                return resolve()
              }
              else{
                  return reject(new ValidationError({message:' a valid state and country is required'}))
              }

           })

        }).then(()=>{
          return Role.findOne({where:{
            name:role_name
          },
          include:{
            model:Permission,
           
            through:'roles_permissions'
          },
          attributes:['id','name']
        
          })
        }).then(roles=>{
              return new Promise((resolve,reject)=>{
                    if(roles){
                      return resolve(roles)
                    }
                    else{
                      return reject(new ValidationError({message:'a valid role is required'})) 
                    }
              })


        }).then(role=>{
            delete user.role
            delete user.gReCaptchaToken
          permissions = role.Permissions
          user.role_id = role.id
          user.active =false
         
          user.username=user.firstName+" "+user.lastName+" "+uuidv4()

          return User.create(user)
        }).then(u=>{
          createdUser =u
          return  u.setPermissions(permissions)

        }).then(ps=>{
            //once the user is created 
           return sails.services.userservice.notifyActiveAccount(createdUser)
        }).then(message=>{
          
            if(message){
              notification = message
              generatedNumber = notification.generatedNumber

              let {expires} = sails.config.custom.otpconf
                //must return the generated code in the user service because its undefined in this function
              
                return AuthCode.create({
                 value:generatedNumber,
                 expiredDate:dayjs().add(expires.value,expires.unit).toISOString(),
                 user_id:createdUser.id,
                 type:'ACCOUNT_ACTIVATION'
                })
              
            }
            else{
              return undefined      
            }
        }).then(async sd=>{
            if(sd){
                const type = notification.email?'email':'phonenumber'
                callback(null,{message:'a verification code was sent to your '+type+' successfully',user:createdUser})    
             }
            else{
              createdUser.active = true
              await createdUser.save()  
              callback(null,{message:'registration completed successfully',user:createdUser})    
            }

        }).catch(e=>{
          console.log(e)
          if(e instanceof ValidationError){
              callback(e,null)
          }
          else{
            callback(new SqlError(e),null)
          }
        })
      
    }
    else{
      callback(new ValidationError(validationRequest),null)
    }
}
exports.login = function (req, identifier, password, next) {
      const configRoles =sails.config.custom.roles 
      const undashboardRoles = Object.keys(configRoles).filter(k=>k!=="student"&&!configRoles[k].dashboardUser).map(k=>configRoles[k].name)
      
      let {query,allowedRoles}   =req.dash_login?{query:{isDeleted:false,email:identifier},allowedRoles:{[Op.notIn]:undashboardRoles}}:
      (req.student_login?{query:{username:identifier,isDeleted:false},allowedRoles:[configRoles.student.name]}:{query:{[Op.and]:[{isDeleted:false},{[Op.or]:[{email:identifier},{phonenumber:identifier}]}]},allowedRoles:{[Op.in]:undashboardRoles}});
       User.findOne({where:query,
      include:{
        model:Role,
        foreignKey:'role_id',
        where:{
          name:allowedRoles
        }
        
      }}).then(function ( user) { 
         
      if (!user) {
        
        next(err=new BadCredentialsError(),user=null,info='Bad Credentials');
      }
      else{
          UserAuthSettings.findOrCreate({where:{
              user_id:user.id
          },defaults:{
            user_id:user.id
          }}).then(([settings,created])=>{
             UserAuthSettings.validatePassword(settings,password,user.password,async (err,authenticated)=>{
                if(err){
                  next(err=err,user=null)
                }
                else{
                  if(authenticated){
                    next(null,{user,authetication:true},info='user authentificated');
                  }
                  else{
                     next(err=new BadCredentialsError());
                  }
                }
              })
            })
          }
     }).catch(err=>{
      next(err);

    });
  };