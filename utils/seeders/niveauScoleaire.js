let data = [{id:1,name_ar:'السنة أولى إبتدائي',name_fr:'première année du primaire'},
{id:2,name_ar:'السنة ثانية إبتدائي',name_fr:'deuxieme année du primaire'         },
  {id:3,name_ar:'السنة ثالثة إبتدائي',name_fr:'troisieme année du primaire'          },
    {id:4,name_ar:'السنة رابعة إبتدائي',name_fr:'quaterieme année du primaire'       },
      {id:5,name_ar:'السنة خامسة إبتدائي',name_fr:'cinquieme année du primaire'        },
        {id:6,name_ar:'السنة السادسة إبتدائي',name_fr:'sixieme année du primaire       '}]
const verify = async ()=>{

  return (await NiveauScolaire.findAll()).length>0
}
module.exports= async ()=>{

  if(!(await verify())) {
      try{
        await NiveauScolaire.bulkCreate(data,{
          individualHooks:true
        })
      }catch(e){
        console.log('error',e)
      }
    }
}


