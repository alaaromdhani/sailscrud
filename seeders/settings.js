const { Op } = require("sequelize");

module.exports=async  ()=>{
   let groupedDatabaseSettings ={}
   let groupedSettings = {} 
   let Settings = [{
       key:'ORANGE_SMS_API',
       value:JSON.stringify({ authorization_header:'Basic TG5yZFFaU09Ca2I2NVZQeHU1QUdkRmFvcDFSQTY2a1E6YUpzVERNbmhBR3BQQVR1eA==',
       sender:'2160000'})
    },
    {
        key:'ACCOUNT_ACTIVATION',
        value:JSON.stringify({ active:true,
            type:{
                email_verification:{active:true},
                sms_verification:{active:true}

        }})
     }]
    Settings.forEach(element=>{
        groupedSettings[element.key] = element
    });
    (await WebsiteSettings.findAll()).forEach(element => {
          groupedDatabaseSettings[element.key] = element  
    });
    let SettingsToDelete = Object.keys(groupedDatabaseSettings).filter(k=>!groupedSettings[k]).map(k=>groupedDatabaseSettings[k])
    let SettingsToUpdate = []
    let SettingsToCreate = []
    Object.keys(groupedSettings).forEach(k=>{
        if(!groupedDatabaseSettings[k]){
            SettingsToCreate.push(groupedSettings[k])
        }
        else{
            if(groupedDatabaseSettings[k].value!==groupedSettings[k].value){
                groupedDatabaseSettings[k].value = groupedSettings[k].value
                SettingsToUpdate.push(groupedDatabaseSettings[k])
            }   
        }
    })
    if(SettingsToDelete.length){
        await WebsiteSettings.destroy({where:{
            key:{
                [Op.in]:SettingsToDelete.map(e=>e.key)
            }
        }})
    }
    if(SettingsToCreate.length){
        await WebsiteSettings.bulkCreate(SettingsToCreate)
    }
    if(SettingsToUpdate.length){
       await Promise.all(SettingsToUpdate.map(s=>s.save()))
    }
    return

        




}