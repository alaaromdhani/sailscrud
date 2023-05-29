const { default: axios } = require("axios")
const UnkownError = require("../../utils/errors/UnknownError")

var token =""    
module.exports = {
    
    login:()=>{
        const authorization_header = sails.config.custom.otpconf.authorization_header
        console.log(authorization_header)        
        axios.post('https://api.orange.com/oauth/v3/token',{
            grant_type:'client_credentials'

        },{
            headers:{
                "Authorization":authorization_header,
                'Content-Type': 'application/x-www-form-urlencoded'

            }
            

        }).then(data=>{
           
            if(data.data.access_token){
                token = data.data.access_token
                console.log(token)    
            }

        }).catch(err=>{

            console.log(err)
        })

    },
    sendPasswordNotification:(auth,callback)=>{
        console.log(token)
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