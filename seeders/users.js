module.exports=async ()=>{

    let usersToAdd =[] 
    const role = await Role.findOne({where:{name:sails.config.custom.roles.inspector.name},include:{
        model:Permission,
        through:'roles_permissions'
    }})
    const roleTeacher = await Role.findOne({where:{name:sails.config.custom.roles.intern_teacher.name},include:{
        model:Permission,
        through:'roles_permissions'
    }}) 
    let roles = []
    roles.push(role)
    roles.push(roleTeacher)
 
    let user1 =   {
        firstName:"firstName",
        lastName:"lastName",
       password:"123456",
        "email":"firstName.lastName@madar.tn",
        "phonenumber":77884455,
        "role_id":role.id,
         "country_id":222
    }
    for(let i=0;i<10;i++){
        let u ={ 
            firstName:user1.firstName+""+i,
            lastName:user1.lastName+""+i,
            password:"123456",
            username:user1.firstName+"."+user1.lastName,
            email:user1.firstName+"."+user1.lastName+""+i+"@madar.tn",
            role_id:role.id,
            country_id:222,

        
        }
        usersToAdd.push(u)

    }
    for(let i=10;i<20;i++){
        let u ={ 
            firstName:user1.firstName+""+i,
            lastName:user1.lastName+""+i,
            password:"123456",
            username:user1.firstName+"."+user1.lastName,
            email:user1.firstName+"."+user1.lastName+""+i+"@madar.tn",
            role_id:roleTeacher.id,
            country_id:222,

        
        }
        usersToAdd.push(u)

    }
//    await Promise.all(usersToAdd.map())
   let createdUsers =  await User.BulkCreate(usersToAdd)
   let groupedRoles = {} 
   roles.forEach(r=>{
        groupedRoles[r.id] = r
   })
   return await Promise.all(createdUsers.map(u=>u.setPermissions(groupedRoles[u.role_id].Permissions)))
    
   

}