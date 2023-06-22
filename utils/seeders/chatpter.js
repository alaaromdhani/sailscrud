const verify = async ()=>{
    return (await Chapitre.findAll()).length
}
const createChapitres = async ()=>{
     let chapters = []
    for(let i=1;i<31;i++){
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
