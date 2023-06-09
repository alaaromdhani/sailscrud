const { UniqueConstraintError } = require("sequelize");
const { BadCredentialsError } = require("../../../utils/errors/lockedError");
const generateToken = require("../../../utils/generateToken");
const schemaValidation = require("../../../utils/validations");
const {UserShema, registerSchema} = require("../../../utils/validations/UserSchema");
const SqlError = require("../../../utils/errors/sqlErrors");
const ValidationError = require("../../../utils/errors/validationErrors");




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
        Role.findOne({where:{name:'registred'},include:{
            model:Permission,
            through:'roles_permissions'

        }}).then(role=>{
          user.role_id = role.id
          return Promise.all([User.create(user),role.Permissions])

        }).then(results=>{
            const permissions = results[1]
            const user = results[0]
            return Promise.all([user,user.addPermissions(permissions)])  

        }).then(([createdUser,permissions])=>{
          callback(null,{user,createdUser})


        }).catch(e=>{
          callback(new SqlError(e),null)
        })
    }
    else{
      callback(new ValidationError(validationRequest),null)
    }
}
exports.login = function (req, identifier, password, next) {
    console.log()
    var isEmail = validateEmail(identifier)
      , query   = {};
  
    if (isEmail) {
      query.email = identifier;
    }
    else {
      query.username = identifier;
    }
  
    User.findOne({where:query}).then(function ( user) { 
      console.log(user)
      if (!user || user.isDeleted) {
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
                  
                  //this error meaning eather there is an errror in the code or login reactive time is not over yet
                  next(err=err,user=null)
                }
                else{
                  
                    if(authenticated){
                  
                      const token = await generateToken(user)
                      
                      UserToken.create({
                        token,user_id:user.id

                      }).then(t=>{
                        next(null,{user,token},info='user authentificated');
                      }).catch(err=>{
                        console.log(err)
                        next(err,null,info=err)
                      })
                      
                  }
                  else{
                    
                    next(err=new BadCredentialsError());
                  }

                  }
                  
                
                


              })

          })
      
      
      }
      
  
      /*sails.models.passport.findOne({
        protocol : 'local'
      , user     : user.id
      }, function (err, passport) {
        if (passport) {
          Passport.validatePassword(passport, password, function (err, res) {
            if (err) {
              return next(err);
            }
  
            if (!res) {
              return next(null, false);
            } else {
              return next(null, user, passport);
            }
          });
        }
        else {
          return next(null, false);
        }
      });*/
    }).catch(err=>{
      next(err);

    });
  };