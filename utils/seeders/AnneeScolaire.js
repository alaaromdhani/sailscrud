module.exports = async ()=>{
    const count = await AnneeScolaire.count()
    if(!count){
        let anneeScolaireToCreate= []
        for(let i=2022;i<=2030;i++){
            anneeScolaireToCreate.push({
                startingYear:i,
                endingYear:i+1
            })
        }
       return await AnneeScolaire.bulkCreate(anneeScolaireToCreate)
      /*let ns_ids =   (await NiveauScolaire.findAll()).map(ns=>ns.id)
      let recordsToCreate = []  
      created.forEach(element => {
            ns_ids.forEach(ns_id=>{
                recordsToCreate.push({
                    niveau_scolaire_id:ns_id,
                    annee_scolaire_id:element.id
                })

            })
        });
        return await AnneeNiveauUser.bulkCreate(recordsToCreate)*/
    }




}