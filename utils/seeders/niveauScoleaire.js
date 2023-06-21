let data = [{name_ar:'السنة أولى إبتدائي',name_fr:'première année du primaire'},
{name_ar:'السنة ثانية إبتدائي',name_fr:'deuxieme année du primaire'         },
  {name_ar:'السنة ثالثة إبتدائي',name_fr:'troisieme année du primaire'          },
    {name_ar:'السنة رابعة إبتدائي',name_fr:'quaterieme année du primaire'       },
      {name_ar:'السنة خامسة إبتدائي',name_fr:'cinquieme année du primaire'        },
        {name_ar:'السنة السادسة إبتدائي',name_fr:'sixieme année du primaire       '}]
const verify = async ()=>{

  return (await NiveauScolaire.findAll()).length>0
}
module.exports= async ()=>{

  console.log()
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


