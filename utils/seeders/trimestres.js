const data = [

  { id:1,name_ar: 'الثلاثي الأول',name_fr:'premiere trimestre',startDay:15,endDay:31,startMonth:8,endMonth:11,active:true},
  { id:2,name_ar: 'الثلاثي الثاني',name_fr:'deuxieme trimestre',startDay:1,endDay:15,startMonth:0,endMonth:2,active:true},
  {id:3,name_ar:  'الثلاثي الثالث',name_fr:'troisieme trimestre',startDay:16,endDay:30,startMonth:2,endMonth:5,active:true},
  
  {id:4,name_ar:  'المدرسة الصيفية',name_fr:"l'école d'été",isSummerSchool:true,startDay:1,endDay:14,startMonth:6,endMonth:8,active:false}
]
/*const verify = async ()=>{
  return  databaseTrimestres.length>0 && data.length===databaseTrimestres.length &&  !data.some(t=>databaseTrimestres.map(dt=>dt.id).some(dt=>dt.id===t.id))
}*/
module.exports=async ()=>{
  let databaseTrimestres = await Trimestre.findAll()   
  let trimestresToAdd = []
  let trimestresToUpdate = []
  data.forEach(element => {
    if(!databaseTrimestres.some(t=>t.id===element.id)){
      trimestresToAdd.push(element)
    }
    else{
      let e = databaseTrimestres.filter(t=>t.id===element.id).at(0)
      trimestresToUpdate.push(Object.assign(e,element))
    }

  });  
  if(trimestresToAdd.length){
    return (await Trimestre.bulkCreate(trimestresToAdd))
  }
  if(trimestresToUpdate.length){
    return await Promise.all(trimestresToUpdate.map(t=>t.save()))
  }
  return 

}
