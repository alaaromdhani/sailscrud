

var superUser = {
    firstName:'ala',
    lastName:'romdhani',
    username:'ala.romdhani',
    password:'123456',
    email:'ala.romdhani@mada.tn',
    role:{
        name:"superadmin"
    },

    phonenumber:'+21655733554',

    birthDate:new Date('1998-03-11')


}
module.exports = async ()=>{
    console.log('user seeder')
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
            User.findOrCreate({where:{
                username:superUser.username

            },include:[{
                model:Permission

            },{
                model:Feature

            }],defaults:superUser}).then(([user,created])=>{

                user.setPermissions(role.Permissions)
                user.setFeatures(role.Features)
            })

        }
        else{
            throw Error({message:'role does not exist'})
        }




    }
    catch(e){
        console.log(e)
    }




}

