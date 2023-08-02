module.exports =async ()=> {
     let niveau_scolaires = await NiveauScolaire.findAll()
    let subjects =[] 
    for(let i=0;i<10;i++){
        subjects.push({
            name:"subject"+i,
            description:i+"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam quibusdam ipsa corrupti quae. Qui, dolor magnam. Voluptatem culpa eos magni ratione ducimus illo a aut totam sapiente, cumque provident porro.",   
            color:"#ffffff",
            domaine_id:1
        })

    }
    const createdSubjects = await Matiere.BulkCreate(subjects)
    let niveau_matieres = []
    
/*    createdSubjects.forEach((element,i)=>{
           for(let index=i;index<createdSubjects.legth)



    })*/
    /*let roles = []
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

    }*/
//    await Promise.all(usersToAdd.map())
   /*let createdUsers =  await User.BulkCreate(usersToAdd)
   let groupedRoles = {} 
   roles.forEach(r=>{
        groupedRoles[r.id] = r
   })
   return await Promise.all(createdUsers.map(u=>u.setPermissions(groupedRoles[u.role_id].Permissions)))*/
 


}