module.exports={
    getAccountActivationSettings:async ()=>{
        let defaultSetings = { active:true,
            type:{
                email_verification:{active:false},
                sms_verification:{active:true}

            }}
        return new Promise((resolve,reject)=>{
            WebsiteSettings.findOne({
                where:{
                    key:'ACCOUNT_ACTIVATION'
                }
            }).then(websitesettings=>{
               if(websitesettings){
                try{
                    resolve(Object.assign(defaultSetings,JSON.parse(websitesettings.value)))
                }catch(e){
                    reject(e)
                }
               }
               else{
                    resolve()
               }
                //return resolve() 
            }).catch(e=>{
                reject(e)
            })
        })



    }




}