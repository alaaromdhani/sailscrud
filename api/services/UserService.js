const { where } = require("sequelize")
const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const UnkownError = require("../../utils/errors/UnknownError")
const SqlError = require("../../utils/errors/sqlErrors")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")


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
                console
            return Promise.all([Role.findOne({where:{id:data.role_id}}),data])

        }).then(([role,data])=>{
            console.log(role)
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
            
            return resolve({data,permissions,features})




            })

        }).then(async ({data,permissions,features})=>{
              try{
                await User.update(user,{where:{id:data.id}})
                if(permissions.length>0){
                        await data.setPermissions([])
                        await data.addPermissions(permissions)

                }
                if(features.length>0){
                    await data.setFeatures([])
                    await data.addFeatures(features)

                }
                callback(null,data)
              }
              catch(e){
                callback(new SqlError(e),null)
              }
                

        }).catch(err=>{
            callback(err,null)


        })
       



    }




}