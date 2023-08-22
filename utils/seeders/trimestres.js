const data = [

  { id:1,name_ar: 'الثلاثي الأول',name_fr:'premiere trimestre'},
  { id:2,name_ar: 'الثلاثي الثاني',name_fr:'deuxieme trimestre'},
  {id:3,name_ar:  'الثلاثي الثالث',name_fr:'troisieme trimestre'},
  
  {id:4,name_ar:  'المدرسة الصيفية',name_fr:"l'école d'été",isSummerSchool:false}
]
/*const verify = async ()=>{
  return  databaseTrimestres.length>0 && data.length===databaseTrimestres.length &&  !data.some(t=>databaseTrimestres.map(dt=>dt.id).some(dt=>dt.id===t.id))
}*/
module.exports=async ()=>{
  let databaseTrimestres = await Trimestre.findAll()   
  let trimestresToAdd = []
  data.forEach(element => {
    if(!databaseTrimestres.some(t=>t.id===element.id)){
      trimestresToAdd.push(element)
    }
  });  
  if(trimestresToAdd.length){
    return (await Trimestre.bulkCreate(trimestresToAdd))
  }
  return 

}
