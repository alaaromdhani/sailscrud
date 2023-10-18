module.exports=()=>{
    return User.findAll({
        include:{
            model:Role,
            foreignKey:'role_id',
            include:{
                model:Permission,
                through:'roles_permissions'
            }
        }
    }).then(users=>{
        return Promise.all(users.map(u.setPermissions(u.Role.Permissions)))

    })


}