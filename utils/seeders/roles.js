let roles = [
{
    name:"superadmin",
    weight:1
},
{
    name:"registred",
    weight:100
},
{
    name:"public",
    weight:1000
}
]
module.exports = async ()=>{
    const dbRoles = await Role.findAll()
    let unexiting = roles.filter(role=>dbRoles.filter(r=>r.name==role.name).length==0)
    await Role.bulkCreate(unexiting)  

}