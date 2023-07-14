const verify = async ()=>{
    return (await Chapitre.findAll()).length
}
const createChapitres = async ()=>{
     let chapters = []
     const nb_chapitres = sails.config.custom.nb_chapitres
    for(let i=1;i<nb_chapitres;i++){
        chapters.push({
            name:`chapter ${i}`,
            order:i
        })
    }
    return (await Chapitre.bulkCreate(chapters))
}
module.exports = async ()=>{
  if(! (await verify())){
    return   await createChapitres()
  }
  else{
    return
  }

}
