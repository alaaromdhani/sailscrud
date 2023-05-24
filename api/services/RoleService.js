const UnauthorizedError = require("../../utils/errors/UnauthorizedError")
const SqlError = require("../../utils/errors/sqlErrors")


module.exports = {
    create:(req,role,callback)=>{
        new Promise((resolve,reject)=>{
            if(req.role.weight<=role.weight){
                return resolve()

            }
            else{
                return reject(new UnauthorizedError({specific:'you can add roles higher than you '}))

            }



        }).then(()=>{
           return  new Promise(async(resove,reject)=>{
                if(!role.permissions && !role.features){
                    let regitredRole = await Role.findOne({where:{name:'registred'},include:[{
                        model:Permission,
                        through:'roles_permissions'

                    },
                    {
                        model:Feature,
                        through:'roles_features'

                    }]})
                    return{permissions:regitredRole.Permissions,features:regitredRole.Features}


            }
            else{
                    let permissions = []
                    let features = []
                    if(role.permissions){
                        const testPermissions = sails.services.permissionservice.canAssignPermissions(req.user,role.permissions)
                        if(testPermissions){
                                permissions = sails.services.permissionservice.convertPermissions(req.user,role.permissions)
                        }
                        else{
                            return reject(new UnauthorizedError({specific:'cannot assign permissions you do not have'}))
                        }
                    }
                    if(role.features){
                        const testFeatures = sails.services.permissionservice.canAssignFeatures(req.user,role.features)
                        if(testFeatures){
                                features = sails.services.permissionservice.convertFeatures(req.user,role.features)
                        }
                        else{
                            return reject(new UnauthorizedError({specific:'cannot assign features you do not have'}))
                        }

                    }
                    
                    return resove({permissions,features})

            }


            })



          }).then(async ({permissions,features})=>{
            try{
                role.addedBy = req.user.id
                let createdRole = await Role.create(role)
                if(permissions.length>0){
                 await    createdRole.addPermissions(permissions)
                }
                else{
                   await  createdRole.addFeatures(features)
                    
                }
                callback(null,createdRole)
            }
            catch(e){
                callback(new SqlError(e),null)
            }



          }).catch(err=>{
            callback(err,null)

          })

    },
    update:(req,role,callback)=>{
        
             new Promise((resolve,reject)=>{
                //verfiying the parameters of the ew role
                if(role.weight>=req.role.weight){
                    return resolve()

                }
                else{
                    return reject(new UnauthorizedError({specific:'you cannot a higher weigh to a role'}))
                }

            }).then(async ()=>{
                //finding the role
               let data = await Role.findByPk(req.params.id,{
                include:{
                    model:User,
                    forignKey:'role_id'
                }
               })
               return new Promise((resolve,reject)=>{
              
                if(data){
                     return resolve(data)   
                }
                else{
                    return reject(new RecordNotFoundErr({specific:'role'}))
                }


                })
                
                
            }).then(data=>{
                //validate the role curently modified
                return new Promise((resolve,reject)=>{
                    if(data.weight>req.role.weight || data.addedBy == req.user.id){
                        return resolve(data)
                    }
                    else{
                        return reject(new UnauthorizedError({specific:'you cant update this role'}))
                    }
    
    
                })
    
    
            }).then(data=>{
    
                return new Promise((resolve,reject)=>{
                    let permissions = []
                let features = []
                if(role.permissions){
                    const testPermissions = sails.services.permissionservice.canAssignPermissions(req.user,role.permissions)
                    if(testPermissions){
                            permissions = sails.services.permissionservice.convertPermissions(req.user,role.permissions)
                    }
                    else{
                        return reject(new UnauthorizedError({specific:'cannot assign permissions you do not have'}))
                    }
                }
                if(role.features){
                    const testFeatures = sails.services.permissionservice.canAssignFeatures(req.user,role.features)
                    if(testFeatures){
                            features = sails.services.permissionservice.convertFeatures(req.user,role.features)
                    }
                    else{
                        return reject(new UnauthorizedError({specific:'cannot assign features you do not have'}))
                    }
    
                }
                
                return resolve({data,permissions,features})
    
    
    
    
                })
    
            }).then(async ({data,permissions,features})=>{
                  try{
                    await Role.update(role,{where:{id:data.id}})
                    if(permissions.length>0){
                            await data.setPermissions([])
                            await data.addPermissions(permissions)
                            if(data.Users.length>0){
                                const userIds = data.Users.map(u=>u.id)
                                await User.sequelize.query(`DELETE FROM users_permissions WHERE UserId IN (${userIds.join(',')})`)
                             
                                for(let u of data.Users){
                                    await u.addPermissions(permissions)
        
        
                                } 
                            }
    
                    }
                    if(features.length>0){
                        await data.setFeatures([])
                        await data.addFeatures(features)
                        if(data.Users.length>0){
                            const userIds = data.Users.map(u=>u.id)
                            await User.sequelize.query(`DELETE FROM users_features WHERE UserId IN (${userIds.join(',')})`)
                         
                            for(let u of data.Users){
                                await u.addFeatures(features)
    
    
                            } 
                        }
    
                    }
                   
                    callback(null,data)
                
                }                
                catch(e){
                    console.log(e)
                    callback(new SqlError(e),null)
                }
                    
    
            }).catch(err=>{
                callback(err,null)
    
    
            })
           
    
    
    
        
    


    }



}