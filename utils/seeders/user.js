

var superUser = {
    username:'ala.romdhani',
    password:'123456',
    email:'ala.romdhani@mada.tn',
    role:{
        name:"superadmin"
    },
    phonenumber:'29208660'
}
module.exports = async ()=>{
    try{
        let role = await Role.findOne({where:{
            name:superUser.role.name
        },include:[{
            model:Permission
    
        },{
            model:Feature
    
        }]})
        if(role){
            delete superUser.role
            superUser.role_id = role.id
        }
        else{
            throw Error({message:'role does not exist'})
        }
        
        let [user,created] = await User.findOrCreate({where:{
            username:superUser.username
    
        },include:[{
            model:Permission
    
        },{
            model:Feature
    
        }],defaults:superUser})
        if(created){
            user.addPermissions(role.Permissions)
        }
        else{
            let permissionsToAdd = role.Permissions.filter(p=>user.Permissions.filter(permission=>permission.model_id==p.model_id && permission.action==p.action).length==0)
            let permissionToDelete = user.Permissions.filter(p=>role.Permissions.filter(permission=>permission.model_id==p.model_id && permission.action==p.action).length==0)
            if(permissionsToAdd.length>0){
                await user.addPermissions(permissionsToAdd)

            }
            if(permissionToDelete.length>0){
                await user.removePermissions(permissionToDelete)


            }
        }
        
        
    }
    catch(e){
        console.log(e)
    }
    
    


}

