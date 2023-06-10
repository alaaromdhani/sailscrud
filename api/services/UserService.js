const { where } = require("sequelize")
const uiid = require('uuid').v4
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const UnkownError = require("../../utils/errors/UnknownError")
const SqlError = require("../../utils/errors/sqlErrors")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")
const ValidationError = require("../../utils/errors/validationErrors")
const dayjs = require("dayjs")
const {Op} = require('sequelize')
const { SAPassportLockedError } = require("../../utils/errors/lockedError")
const { getDifferenceOfTwoDatesInTime } = require("../../utils/getTimeDiff")
const bcrypt = require("bcrypt")
const schemaValidation = require("../../utils/validations")
const { profileUpdate } = require("../../utils/validations/UserSchema")




var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
let phoneregex = /^(\+|\d{1,3})\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
module.exports = {

    create:(req,user,callback)=>{
        const where = user.role_id?{id:user.role_id}:{name:'registred'}
        Role.findOne({where,include:[{
            model:Permission,
            through:'roles_permissions'


        },
        {
            model:Feature,
            through:'roles_features'


        }]
        }).then(role=>{
            
            return new Promise((resolve,reject)=>{
                if(!role){
                    const err = {specific:'cannot find a role with id '+user.role_id}
                        return reject( new UnauthorizedError(err))
    
                }
                if(req.role.weight<=role.weight){

                    return resolve(role)
                }
                else{
                    const err = {specific:'cannot set a higher role'}
                        return reject( new UnauthorizedError(err))
    
                } 
            })
        }).then(role=>{
            
          return new Promise((resove,reject)=>{
            if(!role){
                return reject(new UnauthorizedError({specific:'cannot find registred role '}))
            }
            if(!user.permissions && !user.features){
                user.role_id = role.id
                return resove({permissions:role.Permissions,features:role.Features})
                

            }
            else{
                    let permissions = []
                    let features = []
                    if(user.permissions){
                        const testPermissions = sails.services.permissionservice.canAssignPermissions(req.user,user.permissions)
                        if(testPermissions){
                                permissions = sails.services.permissionservice.convertPermissions(req.user,user.permissions)
                        }
                        else{
                            return reject(new UnauthorizedError({specific:'cannot assign permissions you do not have'}))
                        }
                    }
                    if(user.features){
                        const testFeatures = sails.services.permissionservice.canAssignFeatures(req.user,user.features)
                        if(testFeatures){
                                features = sails.services.permissionservice.convertFeatures(req.user,user.features)
                        }
                        else{
                            return reject(new UnauthorizedError({specific:'cannot assign features you do not have'}))
                        }

                    }
                    console.log(permissions)
                    return resove({permissions,features})

            }



          })
            


        }).then(({permissions,features})=>{
            user.addedBy = req.user.id 
              User.create(user).then(async u=>{

                try{
                    if(permissions.length>0){
                        await u.addPermissions(permissions)
        
                    }
                    if(features.length>0){
                        await u.addFeatures(features)
        
                    }
                    callback(null,u)
                }
                catch(e){
                    callback( new SqlError(e),null)
                }

              }).catch(err=>{
                callback(new SqlError(err),null)

              })



        }).catch(e=>{
            
            callback(e,null)

        })



    },
    update:(req,user,callback)=>{
        
        User.findByPk(req.params.id).then((data)=>{
            
            return new Promise((resolve,reject)=>{
                if(data){
                     return resolve(data)   
                }
                else{
                    return reject(new RecordNotFoundErr({specific:'user'}))
                }


            })
            
        }).then((data)=>{
                
            return Promise.all([Role.findOne({where:{id:data.role_id}}),data])

        }).then(([role,data])=>{
           
            return new Promise((resolve,reject)=>{
                if(role.weight>req.role.weight || data.addedBy == req.user.id){
                    return resolve(data)
                }
                else{
                    return reject(new UnauthorizedError({specific:'you cant update this user'}))
                }


            })


        }).then(data=>{

            return new Promise((resolve,reject)=>{
                let permissions = []
            let features = []
            if(user.permissions){
                const testPermissions = sails.services.permissionservice.canAssignPermissions(req.user,user.permissions)
                if(testPermissions){
                        permissions = sails.services.permissionservice.convertPermissions(req.user,user.permissions)
                }
                else{
                    return reject(new UnauthorizedError({specific:'cannot assign permissions you do not have'}))
                }
                delete user.permissions
            }
            if(user.features){
                const testFeatures = sails.services.permissionservice.canAssignFeatures(req.user,user.features)
                if(testFeatures){
                        features = sails.services.permissionservice.convertFeatures(req.user,user.features)
                }
                else{
                    return reject(new UnauthorizedError({specific:'cannot assign features you do not have'}))
                }
                delete user.features

            }
            
            return resolve({data,permissions,features})




            })

        }).then(async ({data,permissions,features})=>{
              try{
                let u = data
                Object.keys(user).forEach(k=>u[k]=user[k])
                u   = await u.save()
                if(permissions.length>0){
                        await u.setPermissions([])
                        await u.addPermissions(permissions)

                }
                if(features.length>0){
                    await u.setFeatures([])
                    await u.addFeatures(features)

                }
                callback(null,u)
              }
              catch(e){
                callback(new SqlError(e),null)
              }
                

        }).catch(err=>{
            callback(err,null)


        })
       



    },
    
    sendResetPasswordNotification:(req,callback)=>{
        const identifier=req.body.identifier
        
     //   console.log(identifier)
        new Promise((resolve,reject)=>{
           //validating the inputs
            if( identifier && typeof(identifier)==='string'){
              if(!EMAIL_REGEX.test(identifier) && !phoneregex.test(identifier)){
                    
                    return reject(new ValidationError({message:'identifier is required'}))
      
              }  
              else{

                    return resolve(identifier)

              }
            }
            else{

                return reject(new ValidationError({message:'identifier is required'}))
            }
        }).then((identifier)=>{
            //finding the user
            return User.findOne({where:{
                [Op.or]:[
                    {email:identifier}
                    ,{
                        phonenumber:identifier
                    
                    }
                ]


            }})



        }).then(user=>{
            //verifying that the user  is not null
            return new Promise((resolve,reject)=>{
                if(user){
                    
                    return resolve(user)

                }
                else{
                    return  reject(new RecordNotFoundErr({specific:'user not found'}))
                }


            })


        }).then(user=>{
            //creating the Settings for that user  if it is not created
            return UserAuthSettings.findOrCreate({where:{
                user_id:user.id


            },defaults:{
                user_id:user.id

            }})


        }).then(([auth,created])=>{

            return new Promise((resolve,reject)=>{
                //verifying that the account is not locked 
                 
                 
                 
                if(auth.loginReactiveTime){
                    let reactive = new Date(auth.loginReactiveTime)
                    let nowDate = new Date()
                    if(nowDate<reactive){
                        var error = new SAPassportLockedError({
                     
                            expires: getDifferenceOfTwoDatesInTime(dayjs(),dayjs(loginReactiveTime)),
                            
                        });
                        return reject(error)
                        
                    }
                    else{
                        return resolve(auth)
                    }
    
                }
                else{
                    return resolve(auth)
                } 


            })   

        }).then(auth=>{
            //verify if he is coming from a lockout so unlock it
            if(auth.loginRetryLimit >=sails.config.auth.lockout.attempts ){
                auth.loginRetryLimit=0
                auth.loginReactiveTime=null

            }
            let token = uiid()
            let expiredTokenTime = dayjs()
            expiredTokenTime = expiredTokenTime.add(sails.config.custom.resetPassword.expires,"minute")
            auth.resetPasswordCode = token
            auth.expiredTimeOfResetPasswordCode = expiredTokenTime.toISOString()
            return auth.save()
            



        }).then(auth=>{
            if(EMAIL_REGEX.test(identifier)){
                
                sails.services.emailservice.sendPasswordNotification(auth,callback)
            }
            else{
                sails.services.otpservice.sendPasswordNotification(auth,callback)

            }
           

        }).catch(err=>{
            
            callback(err,null)

        })
        

    },
    //this function validates the link (front support) if the link is validated then show password modification prompt to the user
    validatePasswordToken:(req,callback)=>{
        const {user_id,code} = req.params
        
        new Promise((resolve,reject)=>{
            if(!user_id){
                return reject(new ValidationError({message:'user_id is required'}))
            }
            if(!code){
                return reject(new ValidationError({message:'code is required'}))
            }
           
            return resolve()
        }).then(()=>{
            //finding a matching settings
            return UserAuthSettings.findOne({where:{user_id},include:{
                model:User,
                foreignKey:'user_id'


            }})


        }).then(auth=>{
            return new Promise((resolve,reject)=>{
                if(!auth || !auth.expiredTimeOfResetPasswordCode || !auth.resetPasswordCode){
                    return reject(new RecordNotFoundErr({specific:'cannot find settings with those parameters'}))
                }
                else{
                    let expiredTimeOfResetPasswordCode= new Date(auth.expiredTimeOfResetPasswordCode) 
                    console.log(getDifferenceOfTwoDatesInTime(dayjs(),dayjs(expiredTimeOfResetPasswordCode)))
                    if((new Date())>expiredTimeOfResetPasswordCode) {
                        return reject(new UnauthorizedError({specific:'expired code'}))
                    }
                    if(auth.resetPasswordCode!=code){

                        return reject(new UnauthorizedError({specific:'wrong code'}))
                    }
                    else{
                        return resolve(auth)        

                    }
                }
            })
        }).then(auth=>{
            //update the auth instance if the user is locked he must be unlocked
            auth.expiredTimeOfResetPasswordCode=(dayjs().add(2,"minute")).toISOString()
            
            auth.loginRetryLimit= 0
            auth.loginReactiveTime= null
            return auth.save()
            
            
                
            
            
        }).then(auth=>{
                callback(null,auth)

        }).catch(err=>{
            callback(err,null)
        })
    },
    resetPassword:(req,callback)=>{
        const password = req.body.password
        if(!password || typeof(password)!='string'){
            callback(new ValidationError({message:'password is required'}),null)
        }
        else{
            sails.services.userservice.validatePasswordToken(req,async(err,auth)=>{
                if(err){
                    callback(err,null) 
                }
                else{
                    let user = auth.User
                    auth.expiredTimeOfResetPasswordCode = null
                    auth.resetPasswordCode = null
                    
                    user.password = password
                    console.log(user)
                    try{
                        await user.save()
                        await auth.save()
                        callback(null,{})

                    }catch(e){
                        callback(new SqlError(e),null)


                    }
                }



            })
        }



    },
    profileUpdater:(req,callback)=>{
       const updateProfileSchema = schemaValidation(profileUpdate)(req.body)
      
    
       if(updateProfileSchema.isValid){


             
        User.findOne({where:{
         //finding the user
            id:req.user.id

        }}).then(user=>{
                return new Promise((resolve,reject)=>{
                    //in this step verify if the user wants or not to update his password
                    //if he wants to update his password  he has to mention the old one    
                    if(!req.body.oldPassword && !req.body.newPassword){
                             
                            return  resolve(user)

                        }
                        if(req.body.oldPassword && req.body.newPassword){
                            return resolve(user)
                        }
                        return reject(new UnauthorizedError({specific:'you have to specify both the old and the new password'}))

                })
        }).then(user=>{
             
            if(req.body.oldPassword && req.body.newPassword){
                return {result:bcrypt.compare(req.body.oldPassword,user.password),user}
            }
            else{
                return new Promise((resolve,reject)=>{
                    return resolve({result:true,user})

                })


            }




        }).then(async ({result,user})=>{
            const valid = await result
            console.log(valid)
            return new Promise((resolve,reject)=>{
                if(valid){

                    resolve(user)    
                }
                else{
                    return reject(new UnauthorizedError({specific:'passwords do not match'}))
                }


            })




        }).then(user=>{
            if(req.body.oldPassword && req.body.newPassword){
                user.password = req.body.newPassword
            }
                let attributes = req.body
                delete attributes.oldPassword
                delete attributes.newPassword
                
                Object.keys(attributes).forEach(key=>{
                    if(user[key]){
                        user[key]=attributes[key]
                    }


                })
                return user.save()
            }).then(user=>{
                callback(null,user)



            }).catch(err=>{
                callback(err,null)



            })
        }
        else{
            callback(new ValidationError({message:updateProfileSchema.message}),null)

        }






       
        




    }





}