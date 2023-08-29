let data = [{id:1,name_ar:'السنة أولى إبتدائي',name_fr:'première année du primaire',order:1},
{id:2,name_ar:'السنة ثانية إبتدائي',name_fr:'deuxieme année du primaire',order:2         },
  {id:3,name_ar:'السنة ثالثة إبتدائي',name_fr:'troisieme année du primaire',order:3          },
    {id:4,name_ar:'السنة رابعة إبتدائي',name_fr:'quaterieme année du primaire',order:4       },
      {id:5,name_ar:'السنة خامسة إبتدائي',name_fr:'cinquieme année du primaire',order:5        },
        {id:6,name_ar:'السنة السادسة إبتدائي',name_fr:'sixieme année du primaire',order:6}]

module.exports= async ()=>{

  let databaseNiveaux = await NiveauScolaire.findAll()   
  let niveauToAdd = []
  let niveauToUpdate = []
  data.forEach(element => {
    if(!databaseNiveaux.some(t=>t.id===element.id)){
      niveauToAdd.push(element)
    }
    else{
      let e = databaseNiveaux.filter(t=>t.id===element.id).at(0)
      niveauToUpdate.push(Object.assign(e,element))
    }

  });  
  if(niveauToAdd.length){
     (await NiveauScolaire.bulkCreate(niveauToAdd))
  }
  if(niveauToUpdate.length){
     await Promise.all(niveauToUpdate.map(t=>t.save()))
  }
  return 
}


