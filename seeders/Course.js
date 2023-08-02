module.exports=async ()=>{
    const modules = await Module.findAll({include:{
        model:MatiereNiveau,
        foreignKey:'matiere_niveau_id'
    }})
    let courses = []
    modules.forEach((m,index) => {
        for(let i=0;i<10;i++){
            courses.push({
                name:'course'+m.name+" module "+m.id+" number "+i,
                description:m.id+'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa, qui. Ipsa exercitationem eos optio quos, quae cum. Assumenda consequuntur doloremque iure illum beatae repellat, nihil, dignissimos odio at nam rem.',
                type:'cours',
                order:i+1,
                niveau_scolaire_id:m.MatiereNiveau.NiveauScolaireId,
                module_id:m.id,
                matiere_id:m.MatiereNiveau.MatiereId,
                matiere_niveau_id:m.MatiereNiveau.id,
                rating:0
            })
        }
    });
    return    await Course.bulkCreate(courses)
     

}