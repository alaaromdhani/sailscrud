
let data =   [{ name:'العربية',description: 'العربية',color: '#f20530'},
    {name:'الرياضيات', description: 'الرياضيات',color:  '#05aff2'},
      { name:'الإيقاظ العلمي',description:  'الإيقاظ العلمي',color:  '#f2e205'},
        { name:'الفرنسية',description:  'الفرنسية',color:  '#f28705'},
    {name: 'الإنجليزية',description:  'الإنجليزية',color:  '#d7f205'},
      {name: 'التنشئة الإجتماعية',description:  'التنشئة الإجتماعية',color:  '#a65d03'}]

const verify = async()=>{
    return (await Matiere.findAll()).length>0
}
module.exports = async()=>{


  if(!(await verify())){
    console.log('metiere seeders')
     try{
       return await Matiere.bulkCreate(data,{
         individualHooks:true
       })
     }
     catch(e){
        console.log(e)

     }
    }
}
