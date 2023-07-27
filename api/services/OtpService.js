const { default: axios } = require("axios")
const UnkownError = require("../../utils/errors/UnknownError")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")


var token =""    
module.exports = {
    
    login:async ()=>{
        const authorization_header = sails.config.custom.otpconf.authorization_header
        try{
            let data =  await axios.post('https://api.orange.com/oauth/v3/token',{grant_type:'client_credentials'},{
            headers:{
                "Authorization":authorization_header,
                'Content-Type': 'application/x-www-form-urlencoded'

            }
        })
        if(data.data.access_token){
            token = data.data.access_token
            return token    
        }
        }catch(e){
            console.log('error in auhentifcation',e)
            throw new UnkownError()
        }

    },
    sendSms:async (sms)=>{
            let phonenumbers =  await sails.services.otpservice.beforeSend(sms)
            console.log('sending sms to ',phonenumbers)
            return new Promise((resolve,reject)=>{
                    if(1>0){
                        resolve()
                    }
                    else{
                        reject(new UnkownError())
                    }
            }) 
       
        /*try{
            let phonenumbers =  await sails.services.otpservice.beforeSend(sms)
            let token = await sails.services.otpservice.login()
             await   Promise.all(phonenumbers.map(p=>axios.post('https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B'+sails.config.custom.otpconf.sender+'/requests',{
                outboundSMSMessageRequest: {
                    address: "tel:"+p,
                    senderAddress:"tel:+"+sails.config.custom.otpconf.sender,
                    outboundSMSTextMessage: {
                        message: sms.content
                    }
                }
            } ,{
    
                headers:{
                    Authorization:'Bearer '+token,
                    "Content-Type": "application/json"
    
    
                }
    
            })))

        }
        catch(e){
                console.log('error in sending sms',e)
                throw new UnkownError()
        }*/
    },
    beforeSend:async (sms)=>{
        let phonenumbers 
        if(sms.group_id){
            sms.type_reciever = "group"
            phonenumbers = (await User.findAll({
                where:{
                    role_id:sms.group_id
                },
                attributes:['id','phonenumber']
            })).filter(u=>u.id!=sms.sender_id).map(u=>u.phonenumber)    
        }
        else if(sms.reciever_id || sms.subscriber_id){
            sms.type_reciever = "single"
            if(sms.reciever_id){
               phonenumbers = (await User.findAll({
                where:{
                    id:sms.reciever_id
                },
                attributes:['id','phonenumber']
               })).filter(u=>u.id!=sms.sender_id).map(u=>u.phonenumber)
            }
            else{
                phonenumbers =  (await Subscriber.findAll({
                    where:{
                        id:sms.subscriber_id,
                        isIdentifiedByemail:false
                    },
                    attributes:['identifier']
                   })).map(u=>u.identifier)
            }
        }
        else{
            phonenumbers = (await Subscriber.findAll({
                where:{
                    isIdentifiedByemail:false
                },
                attributes:['identifier']
               })).map(u=>u.identifier)
        }
        if(!phonenumbers || !phonenumbers.length){
            throw new ValidationError('valid recievers are required')
        }
        return phonenumbers
    },
    sendPasswordNotification:(auth,callback)=>{
        
        if(token!=""){
            axios.post('https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B'+sails.config.custom.otpconf.sender+'/requests',{
                outboundSMSMessageRequest: {
                    "address": "tel:+21655733554",
                    senderAddress:"tel:+"+sails.config.custom.otpconf.sender,
                    outboundSMSTextMessage: {
                        message: "Hello!"
                    }
                }
            } ,{

                headers:{
                    Authorization:'Bearer '+token,
                    "Content-Type": "application/json"


                }

            }).then(data=>{

                callback(null,data)

            }).catch(err=>{


                callback(err,null)
            })


        }
        else{
            callback(new UnkownError(),null)

        }
            


    },
    generateToken:()=>{
        return token
    }




}