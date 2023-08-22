const data = [

  { id:1,name_ar: 'الثلاثي الأول',name_fr:'premiere trimestre'},
  { id:2,name_ar: 'الثلاثي الثاني',name_fr:'deuxieme trimestre'},
  {id:3,name_ar:  'الثلاثي الثالث',name_fr:'troisieme trimestre'}
]
const verify = async ()=>{
     return  (await Trimestre.findAll()).length>0
}
module.exports=async ()=>{
  if(!await verify()){
    try{
      return await Trimestre.bulkCreate(data)
    }
    catch(e){
      console.log('sql_error',e)
    }

  }


}
