module.exports =async ()=> {
     let niveau_scolaires = await NiveauScolaire.findAll()
    let inspectors = await User.findAll({
        include:{
            model:Role,
            foreignKey:'role_id',
            where:{
                name:sails.config.custom.roles.inspector.name
            }
        }
    })
    let teachers = await User.findAll({
        include:{
            model:Role,
            foreignKey:'role_id',
            where:{
                name:sails.config.custom.roles.intern_teacher.name
            }
        }
    })
    let subjects =[] 
    for(let i=0;i<10;i++){
        subjects.push({
            name:"subject"+i,
            description:i+"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam quibusdam ipsa corrupti quae. Qui, dolor magnam. Voluptatem culpa eos magni ratione ducimus illo a aut totam sapiente, cumque provident porro.",   
            color:"#ffffff",
            domaine_id:1
        })

    }
    const createdSubjects = await Matiere.bulkCreate(subjects)
    let niveau_matieres = []
    
    createdSubjects.forEach((element,i)=>{
           for(let index=i;index<niveau_scolaires.length;index++){
                niveau_matieres.push({
                    MatiereId:element.id,
                    NiveauScolaireId:niveau_scolaires[index].id,
                    nb_modules:5,
                    inspector:inspectors[index].id,
                    intern_teacher:teachers[index].id,
                    name:"wwaawawa",
                    
                })
           }
     })
     let modules = []
    let createdNiveauMatieres =  await MatiereNiveau.bulkCreate(niveau_matieres)
     createdNiveauMatieres.forEach((mn,index)=>{
        
        if(mn.nb_modules){
            for(let i=0;i<mn.nb_modules;i++){
                modules.push({
                    name:'NOT_ASSIGNED'+i,
                    chapitre_id:(i+1),
                    matiere_niveau_id:mn.id
                })
            }
        }
        


     })
     return await Module.bulkCreate(modules)
     
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