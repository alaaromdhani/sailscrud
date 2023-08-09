const { where } = require('sequelize');
const uiid = require('uuid').v4;
const UnauthorizedError = require('../../utils/errors/UnauthorizedError');
const UnkownError = require('../../utils/errors/UnknownError');
const SqlError = require('../../utils/errors/sqlErrors');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const ValidationError = require('../../utils/errors/validationErrors');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { SAPassportLockedError } = require('../../utils/errors/lockedError');
const { getDifferenceOfTwoDatesInTime } = require('../../utils/getTimeDiff');
const bcrypt = require('bcrypt');
const schemaValidation = require('../../utils/validations');
const { profileUpdate, updateUserSchema } = require('../../utils/validations/UserSchema');
const generateCode = require('../../utils/generateCode');
const { ValidateSchema } = require('../../utils/validations/VerificationCodeSchema');
const { resolve } = require('path');






var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
let phoneregex = /^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
module.exports = {
  
  create: (req, user, callback) => {
    const where = user.role_id ? { id: user.role_id } : { name: 'registred' };
    Country.findByPk(user.country_id).then(c=>{
      return new Promise((resolve,reject)=>{
        if(c && c.active){
          return resolve(c)
        }
        else{
          return reject(new ValidationError({message:'a valid country is required'}))
        }
      })
    }).then(c=>{
      user.phonenumber = c.tel_code.startsWith('+')?c.tel_code+" "+user.phonenumber:'+'+c.tel_code+" "+user.phonenumber
      user.username = user.firstName+" "+user.lastName  
      return user
    }).then(u=>{
     return  Role.findOne({
        where, include: [{
          model: Permission,
          through: 'roles_permissions'
  
  
        },
        {
          model: Feature,
          through: 'roles_features'
  
  
        }]
      
    })
    }).then(role => {

      return new Promise((resolve, reject) => {
        if (!role) {
          const err = { specific: 'cannot find a role with id ' + user.role_id };
          return reject(new UnauthorizedError(err));

        }
        if (req.role.weight <= role.weight) {

          return resolve(role);
        }
        else {
          const err = { specific: 'cannot set a higher role' };
          return reject(new UnauthorizedError(err));

        }
      });
    }).then(role => {

      return new Promise((resove, reject) => {
        if (!role) {
          return reject(new UnauthorizedError({ specific: 'cannot find registred role ' }));
        }
        if (!user.permissions && !user.features) {
          user.role_id = role.id;
          return resove({ permissions: role.Permissions, features: role.Features });


        }
        else {
          let permissions = [];
          let features = [];
          if (user.permissions) {
            const testPermissions = sails.services.permissionservice.canAssignPermissions(req.user, user.permissions);
            if (testPermissions) {
              permissions = sails.services.permissionservice.convertPermissions(req.user, user.permissions);
            }
            else {
              return reject(new UnauthorizedError({ specific: 'cannot assign permissions you do not have' }));
            }
          }
          if (user.features) {
            const testFeatures = sails.services.permissionservice.canAssignFeatures(req.user, user.features);
            if (testFeatures) {
              features = sails.services.permissionservice.convertFeatures(req.user, user.features);
            }
            else {
              return reject(new UnauthorizedError({ specific: 'cannot assign features you do not have' }));
            }

          }
          console.log(permissions);
          return resove({ permissions, features });

        }



      });



    }).then(({ permissions, features }) => {
      user.addedBy = req.user.id;
      User.create(user).then(async u => {

        try {
          if (permissions.length > 0) {
            await u.addPermissions(permissions);

          }
          if (features.length > 0) {
            await u.addFeatures(features);

          }
          callback(null, u);
        }
        catch (e) {
          callback(new SqlError(e), null);
        }

      }).catch(err => {
        callback(new SqlError(err), null);

      });



    }).catch(e => {

      callback(e, null);

    });



  },
  resendNotification:async (req,callback)=>{
    const {type} = req.operation   ////the type should come from the middleware which verifies if the account activation is enabled or not
    let updatedCode
    //an auth code of type account_activation is one instance created during the user registration
    AuthCode.findOne({
        where:{
          user_id:req.user.id,
          type  
        }
      }).then(c=>{
       return new Promise((resolve,reject)=>{
        if(!c){
          return reject(new RecordNotFoundErr())
        }
        const otpconf = sails.config.custom.otpconf.activationCode
        if(c.numberAttempsResend>otpconf.maxSend){
          return reject(new UnauthorizedError({specific:'you reached the maximum number of sms sent please contact the administrator to activate your account'}))
        }
        if(new Date()<new Date(c.resendTime)){
          //i should comeback to this to add the specific date and time
          return reject(new UnauthorizedError({specific:'your resend time is sill going please try again later'})) 
        } 
        
        return resolve(c)


       }) 


      }).then(c=>{
        const otpconf = sails.config.custom.otpconf
        
        let newCode = generateCode()
        //the number of retry attemps should become 0 because the user the value of the code changed
        c.numberAttempsRetry=0
        c.numberAttempsResend++
        c.value = newCode
        c.resendTime = dayjs().add(otpconf.resend.time.value,otpconf.resend.time.unit)
        c.expiredDate = dayjs().add(otpconf.expires.value,otpconf.expires.unit)
        return c
      }).then(c=>{
        updatedCode = c
        return Sms.create({
          content:'your validation code is '+c.value,
          reciever_type:'single',
          reciever_id:req.user.id,
          type
        })
      }).then(sms=>{
          return updatedCode.save()
      }).then(c=>{
          callback(null,{message:'a verification code was sent to your phone successfully'})

      }).catch(err=>{
        console.log(err)
        if(err instanceof UnauthorizedError){
          callback(err,null)
        }
        else{
          callback(new SqlError(err),null)
        }

      })
  },
  update: (req, callback) => {
    let bodyData = {}

    if(req.body.isDeleted && typeof(req.body.isDeleted)==='string'){
      req.body.isDeleted=req.body.isDeleted==='true'?true:false
    }

    Object.keys(req.body).filter(k=>k!='pp').forEach(k=>{
        bodyData[k] = req.body[k]
    })
    console.log(bodyData)
    const bodyDataValidation= schemaValidation(updateUserSchema)(bodyData)
    if(bodyDataValidation.isValid){
      User.findByPk(req.params.id,{
        include:{
          model:Role,
          foreignKey:'role_id'
        }
      }).then((data) => {
          return new Promise((resolve,reject)=>{
            if(data){
                if(req.role.weight>=data.Role.weight && req.user.id!=data.addedBy){
                    return reject(new UnauthorizedError({specific:'you canot update a higher user than you'}))
                }
                else{
                    return resolve(data)
                }
            }
            else{
              reject(new RecordNotFoundErr())
            }


          })
      }).then(data=>{
      
        return data.update(bodyData)
        
      }).then(data=>{
          callback(null,data)
      }).catch(err=>{

        callback(err,null)
      })
  
      }
    else{
       callback(new ValidationError({message:bodyDataValidation.message}))
    }
    
    






  },
  destroyUser:(req,callback)=>{
    User.findByPk(req.params.id,{
      include:[{
        model:Role,
        foreignKey:'role_id'
      },{
        model:User,
        foreignKey:'addedBy',
        as:'adder',
        include:{
          model:Role,
          foreignKey:'role_id'
        }
      }],
    }).then(user=>{
       return new Promise((resolve,reject)=>{
        if(!user){
          return reject(new RecordNotFoundErr())
        }else{
          if(user.addedBy){
            if(user.adder.Role.weight<=req.role.weight && user.addedBy!==req.user.id ){
              return reject(new UnauthorizedError({specific:'you can not delete a higher user'}))
            }
        }
        else{
          if(user.Role.weight<=req.role.weight){
            return reject(new UnauthorizedError({specific:'you can not delete a higher user'}))
          } 
        }
        return resolve(user)
        }
        })


    }).then(user=>{
      return user.destroy()
   
    }).then(sd=>{

      callback(null,{})

    }).catch(err=>{
      console.log(err)
      if(err instanceof UnauthorizedError || err instanceof RecordNotFoundErr){
        callback(err,null)
      }
      else{
        callback(new SqlError(err),null)
       }
    })
  },

  /*sendResetPasswordNotification: (req, callback) => {
    const identifier = req.body.identifier;

    //   console.log(identifier)
    new Promise((resolve, reject) => {
      //validating the inputs
      if (identifier && typeof (identifier) === 'string') {
        if (!EMAIL_REGEX.test(identifier) && !phoneregex.test(identifier)) {

          return reject(new ValidationError({ message: 'identifier is required' }));

        }
        else {

          return resolve(identifier);

        }
      }
      else {

        return reject(new ValidationError({ message: 'identifier is required' }));
      }
    }).then((identifier) => {
      //finding the user
      return User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            {
              phonenumber: identifier

            }
          ]


        }
      });



    }).then(user => {
      //verifying that the user  is not null
      return new Promise((resolve, reject) => {
        if (user) {

          return resolve(user);

        }
        else {
          return reject(new RecordNotFoundErr({ specific: 'user not found' }));
        }


      });


    }).then(user => {
      //creating the Settings for that user  if it is not created
      return UserAuthSettings.findOrCreate({
        where: {
          user_id: user.id


        }, defaults: {
          user_id: user.id

        }
      });


    }).then(([auth, created]) => {

      return new Promise((resolve, reject) => {
        //verifying that the account is not locked



        if (auth.loginReactiveTime) {
          let reactive = new Date(auth.loginReactiveTime);
          let nowDate = new Date();
          if (nowDate < reactive) {
            var error = new SAPassportLockedError({

              expires: getDifferenceOfTwoDatesInTime(dayjs(), dayjs(loginReactiveTime)),

            });
            return reject(error);

          }
          else {
            return resolve(auth);
          }

        }
        else {
          return resolve(auth);
        }


      });

    }).then(auth => {
      //verify if he is coming from a lockout so unlock it
      if (auth.loginRetryLimit >= sails.config.auth.lockout.attempts) {
        auth.loginRetryLimit = 0;
        auth.loginReactiveTime = null;

      }
      let token = uiid();
      let expiredTokenTime = dayjs();
      expiredTokenTime = expiredTokenTime.add(sails.config.custom.resetPassword.expires, 'minute');
      auth.resetPasswordCode = token;
      auth.expiredTimeOfResetPasswordCode = expiredTokenTime.toISOString();
      return auth.save();




    }).then(auth => {
      if (EMAIL_REGEX.test(identifier)) {

        sails.services.emailservice.sendPasswordNotification(auth, callback);
      }
      else {
        sails.services.otpservice.sendPasswordNotification(auth, callback);

      }


    }).catch(err => {

      callback(err, null);

    });


  },*/
  //this function validates the link (front support) if the link is validated then show password modification prompt to the user
  validatePasswordToken: (req, callback) => {
    const { user_id, code } = req.params;

    new Promise((resolve, reject) => {
      if (!user_id) {
        return reject(new ValidationError({ message: 'user_id is required' }));
      }
      if (!code) {
        return reject(new ValidationError({ message: 'code is required' }));
      }

      return resolve();
    }).then(() => {
      //finding a matching settings
      return UserAuthSettings.findOne({
        where: { user_id }, include: {
          model: User,
          foreignKey: 'user_id'


        }
      });


    }).then(auth => {
      return new Promise((resolve, reject) => {
        if (!auth || !auth.expiredTimeOfResetPasswordCode || !auth.resetPasswordCode) {
          return reject(new RecordNotFoundErr({ specific: 'cannot find settings with those parameters' }));
        }
        else {
          let expiredTimeOfResetPasswordCode = new Date(auth.expiredTimeOfResetPasswordCode);
          console.log(getDifferenceOfTwoDatesInTime(dayjs(), dayjs(expiredTimeOfResetPasswordCode)));
          if ((new Date()) > expiredTimeOfResetPasswordCode) {
            return reject(new UnauthorizedError({ specific: 'expired code' }));
          }
          if (auth.resetPasswordCode != code) {

            return reject(new UnauthorizedError({ specific: 'wrong code' }));
          }
          else {
            return resolve(auth);

          }
        }
      });
    }).then(auth => {
      //update the auth instance if the user is locked he must be unlocked
      auth.expiredTimeOfResetPasswordCode = (dayjs().add(2, 'minute')).toISOString();

      auth.loginRetryLimit = 0;
      auth.loginReactiveTime = null;
      return auth.save();





    }).then(auth => {
      callback(null, auth);

    }).catch(err => {
      callback(err, null);
    });
  },
  resetPassword: (req, callback) => {
    const password = req.body.password;
    if (!password || typeof (password) !== 'string') {
      callback(new ValidationError({ message: 'password is required' }), null);
    }
    else {
      sails.services.userservice.validatePasswordToken(req, async (err, auth) => {
        if (err) {
          callback(err, null);
        }
        else {
          let user = auth.User;
          auth.expiredTimeOfResetPasswordCode = null;
          auth.resetPasswordCode = null;

          user.password = password;
          console.log(user);
          try {
            await user.save();
            await auth.save();
            callback(null, {});

          } catch (e) {
            callback(new SqlError(e), null);


          }
        }



      });
    }



  },

  profileUpdater: (req, callback) => {

    let dat = {};
      
    Object.keys(req.body).filter(key => key !== 'pp').forEach(key => { //emtying the requestbody from the pp parameter to be ready for validation
      dat[key] = req.body[key];
    });
    
    const updateProfileSchema = schemaValidation(profileUpdate)(dat);//validation for schema
    if (updateProfileSchema.isValid) { //

        let u

      User.findOne({
        where: {
          //finding the user
          id: req.user.id

        }
      }).then(user => {
        u =user
        return new Promise((resolve, reject) => {
          //in this step verify if the user wants or not to update his password
          //if he wants to update his password  he has to mention the old one
          if (!dat.oldPassword && !dat.newPassword) {
            return resolve(user);
          }
          if (dat.oldPassword && dat.newPassword) {
            return resolve(user);
          }
          return reject(new UnauthorizedError({ specific: 'you have to specify both the old and the new password' }));
        });
      }).then(user => {

        if (dat.oldPassword && dat.newPassword) {

          return bcrypt.compare(dat.oldPassword, user.password)
        }
        else {
          return true
        }
      }).then(result => {
        const valid = result; //checks for matching passwords(old)
        return new Promise((resolve, reject) => {
          if (valid) {

            resolve(u);
          }
          else {
            return reject(new UnauthorizedError({ specific: 'passwords do not match' }));
          }


        });




      }).then( user => {
        //i keep checking if the user wants to update his password
        if (dat.oldPassword && dat.newPassword) {
          user.password = dat.newPassword;
        }
       
        let attributes = dat;
        
        delete attributes.oldPassword;
        delete attributes.newPassword;

        Object.keys(attributes).forEach(key => {
          if (user[key]) {
            user[key] = attributes[key];
          }
        });
        callback(null,user);


      }).catch(err => {
        console.log(err)
        callback(err, null);



      });
    }
    else {
      
      // eslint-disable-next-line callback-return
      callback(new ValidationError({ message: updateProfileSchema.message }), null);

    }
  },
  updateProfilePicture: (req, user, callback) => {
    sails.services.uploadservice.optionGenerator(req, true,'profile-pictures','pp').then(options => { //the options will be generated
      console.log(options);
      sails.services.uploadservice.updateFile(req, options, async (err, data) => {
        if (err) {
          callback(err, null);
        }
        else {
          user.profilePicture = data.link;
          callback(null, await user.save());
        }
      });
    }).catch(err=>{
      callback(err,null);

    });

  },
  activateAccount:(req,callback)=>{
    let vc
    let codeValidated = false
    new Promise((resolve,reject)=>{
        const {validationCode} = req.body
          if(validationCode){
            vc = validationCode
            return resolve()
        }
        else{
          return reject(new ValidationError({message:'the validation code is required'}))
        }
    }).then(()=>{
      return AuthCode.findOne({where:{
        user_id:req.user.id,
        type:'ACCOUNT_ACTIVATION'
      }})
    }).then(code=>{
      return new Promise((resolve,reject)=>{
        if(!code){
          return reject(new RecordNotFoundErr())
        }
        let nowDate =new Date()
        const otpconf = sails.config.custom.otpconf
        if(code.numberAttempsRetry>otpconf.activationCode.maxRetry){
          return  reject(new UnauthorizedError({specific:'you did reach the max retries attemps please hit resend to have a new one'}))
        }
        if(code.numberAttempsResend>otpconf.activationCode.maxSend){
          return  reject(new UnauthorizedError({specific:'you did reach the max resend attemps please contact the administrator to activate your account'}))
        }
        if(nowDate>new Date(code.expiredDate)){
          return  reject(new UnauthorizedError({specific:'your activation code is expired please hit resend to have a new one'}))
        }
        
        return resolve(code)

      })


    }).then(c=>{
      if(c.value===vc){
          let user = req.user
          codeValidated=true
          user.active=true
          return user.save()
      }
      else{
          c.numberAttempsRetry++
          return c.save() 
      }
    }).then(somedata=>{
        return new Promise((resolve,reject)=>{

          if(codeValidated){
            return resolve()
          }
          else{
            return reject(new UnauthorizedError({specific:'wrong validation code'}))
          }
        })

    }).then(()=>{
      return AuthCode.destroy({where:{
        user_id:req.user.id,
        type:'ACCOUNT_ACTIVATION'
      }})
     
    }).then((sd=>{
      callback(null,{message:'your account is activated successfully'})
    })).catch(e=>{
      console.log(e)
      if(e instanceof UnauthorizedError || e instanceof ValidationError){
          callback(e) 
      }
      else{
        callback(new SqlError(e))
      }

    })


  },
  notifyActiveAccount:async (createdUser)=>{
    let defaultConfig = {
      active:true,
      type:{
        email_verification:{active:true},
        sms_verification:{active:true}
        
      }
    }
    let generatedNumber
      let requiredSettings
      return WebsiteSettings.findOne({
        where:{
          key:'ACCOUNT_ACTIVATION'
        }
      }).then(sett=>{
        requiredSettings = sett?Object.assign(defaultConfig,JSON.parse(sett.value)):defaultConfig   
          if(!requiredSettings.active){
            return undefined
          }
          if(requiredSettings.type.sms_verification.active){
            generatedNumber  =generateCode()
            return Sms.create({
              content:'your validation code is '+generatedNumber,
              reciever_type:'single',
              reciever_id:createdUser.id,
              type:'ACCOUNT_ACTIVATION'
            })       
          }
          if(requiredSettings.types.email_verification.active){
            generatedNumber  =generateCode()
            
            return sails.services.emailservice.sendEmail({
              content:'your validation code is '+generatedNumber,
              reciever:createdUser,
              type:'ACCOUNT_ACTIVATION'
            })  
          }
          return undefined
        
         
        
      }).then(somedata=>{
        if(somedata){

          if(requiredSettings.type.sms_verification.active){
           return {sms:true,generatedNumber}
          }
          if(requiredSettings.type.email_verification.active){
            return {email:true,generatedNumber}
          }
        }
        else{
          return undefined
        }
      })
  },
  forgetPassword:(req,callback)=>{
    let generatedNumber
    let user
    let validationCode
    const {phonenumber} = req.body
    if(!phonenumber){
      return callback(new ValidationError({message:'phonenumber is required'}))
    }
    User.findOne({where:{

      phonenumber:'+'+phonenumber
    }}).then(u=>{
        
      return new Promise((resolve,reject)=>{
        if(u){
          user =u
          return resolve(u)
        }
        else{
          return reject(new UnauthorizedError({specific:'the phonenumber you entred does not belong to any user'}))  
        }


      })
    }).then(u=>{
      return AuthCode.findOne({where:{
          user_id:u.id,
          type:'FORGET_PASSWORD'

      }})


    }).then(c=>{

      return new Promise((resolve,reject)=>{
        if(!c){
          return resolve()
        }
        const otpconf = sails.config.custom.otpconf.activationCode
        if(c.numberAttempsResend>otpconf.maxSend){
          return reject(new UnauthorizedError({specific:'you reached the maximum number of sms sent please contact the administrator to activate your account'}))
        }
        if(new Date()<new Date(c.resendTime)){
          //i should comeback to this to add the specific date and time
          return reject(new UnauthorizedError({specific:'your resend time is sill going please try again later'})) 
        } 
        
        return resolve(c)


       }) 



    }).then(c=>{
        if(c){
          validationCode = c
        }
        generatedNumber  =generateCode()
        return Sms.create({
          content:'your validation code is '+generatedNumber,
          reciever_type:'single',
          reciever_id:user.id,
          type:'FORGET_PASSWORD'
        })  
      }).then(sms=>{
      let {expires} = sails.config.custom.otpconf
      //must return the generated code in the user service because its undefined in this function
      if(validationCode){
        validationCode.numberAttempsRetry=0
        validationCode.numberAttempsResend++
        validationCode.value = generatedNumber
        validationCode.resendTime = dayjs().add(otpconf.resend.time.value,otpconf.resend.time.unit)
        validationCode.expiredDate = dayjs().add(otpconf.expires.value,otpconf.expires.unit)
          return validationCode.save()
      } 
      else{
        return AuthCode.create({
          value:generatedNumber,
          expiredDate:dayjs().add(expires.value,expires.unit).toISOString(),
          user_id:user.id,
          type:'FORGET_PASSWORD'
         })
      }  
      
    

    }).then(c=>{
      callback(null,{message:'a verifcation code was sent to your phonenumber successfully'})

    }).catch(e=>{
      if(e instanceof UnauthorizedError ){
        callback(e)
      }
      else{
        callback(new SqlError(e))
      }


    })
  },
  validateCode:(req,callback)=>{
      let codeValidated = false
       const validation = schemaValidation(ValidateSchema)(req.body)
       let user
       if(validation.isValid){
          const {password,conf_pass,phonenumber,code} = req.body
          if(password!==conf_pass){
            callback(new ValidationError('the password and confirm password aren t the same')) 
          }
          User.findOne({where:{
            phonenumber:'+'+phonenumber
          }}).then(u=>{
            user =u
            return new Promise((resolve,reject)=>{
              if(u){
                return resolve(u)
              }
              else{
                return reject(new UnauthorizedError('this phonenumber does not belong to any user'))
              }
            })
          }).then(u=>{
            return AuthCode.findOne({where:{
              user_id:u.id,
              type:'FORGET_PASSWORD'
            }})
          }).then(code=>{
            return new Promise((resolve,reject)=>{
              if(!code){
                return reject(new UnauthorizedError('you cannot access this ressourese'))
              }
              let nowDate =new Date()
              const otpconf = sails.config.custom.otpconf
              if(code.numberAttempsRetry>otpconf.activationCode.maxRetry){
                return  reject(new UnauthorizedError({specific:'you did reach the max retries attemps please hit resend to have a new one'}))
              }
              if(code.numberAttempsResend>otpconf.activationCode.maxSend){
                return  reject(new UnauthorizedError({specific:'you did reach the max resend attemps please contact the administrator to update your password'}))
              }
              if(nowDate>new Date(code.expiredDate)){
                return  reject(new UnauthorizedError({specific:'your activation code is expired please hit resend to have a new one'}))
              }
              
              return resolve(code)
      
            })
          }).then(c=>{
            if(c.value===vc){
              codeValidated=true
              user.password=req.body.password
              return user.save()
            }
            else{
                c.numberAttempsRetry++
                return c.save() 
            }
          }).then(c=>{
            return new Promise((resolve,reject)=>{
              if(codeValidated){  
                  return resolve()
              }
              else{
                  return reject(new UnauthorizedError({specific:'invalid code'}))
              }
            })
          }).then(()=>{
              callback(null,{message:'your password is updated successfully'})


          }).catch(e=>{
            if(e instanceof UnauthorizedError || e instanceof ValidationError){
              callback(e)
            }
            else{
              callback(new SqlError(e))
            }


          })
          
       }
       else{
        return callback(new ValidationError({message:validation.isValid}))
       }
       
  }






};
