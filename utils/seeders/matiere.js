
let data =   [{ name:'العربية',color: '#f20530'},
    {name:'الرياضيات',color:  '#05aff2'},
      { name:'الإيقاظ العلمي',color:  '#f2e205'},
        { name:'الفرنسية'   , color:  '#f28705'},
    {name: 'الإنجليزية'  ,color:  '#d7f205'},
      {name: 'التنشئة الإجتماة الإجتماعية',color:  '#a65d03'}]

const verify = async()=>{
    return (await Domaine.findAll()).length>0
}
module.exports = async()=>{


  if(!(await verify())){
    console.log('metiere seeders')
     try{
       return await Domaine.bulkCreate(data,{
         individualHooks:true
       })
     }
     catch(e){
        console.log(e)

     }
    }
}
