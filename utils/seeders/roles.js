module.exports = async ()=>{
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
        },
        {
            name:sails.config.custom.roles.inspector.name,
            weight:sails.config.custom.roles.inspector.weight
        },
        {
            name:sails.config.custom.roles.intern_teacher.name,
            weight:sails.config.custom.roles.intern_teacher.weight
        },
        {
            name:sails.config.custom.roles.teacher.name,
            weight:sails.config.custom.roles.teacher.weight
        },
        {
            name:sails.config.custom.roles.parent.name,
            weight:sails.config.custom.roles.parent.weight
        },
        {
            name:sails.config.custom.roles.student.name,
            weight:sails.config.custom.roles.student.weight
        },
        {
            name:sails.config.custom.roles.seller.name,
            weight:sails.config.custom.roles.seller.weight
        }
        
        ]
        
    const dbRoles = await Role.findAll()
    let unexiting = roles.filter(role=>dbRoles.filter(r=>r.name==role.name).length==0)
    try{
        console.log('creating the roles')
        await Role.bulkCreate(unexiting)  
    }
    catch(e){
        console.log(e)
    }
    console.log('roles created')
}