const nodemailer = require('nodemailer');
const { getDifferenceOfTwoDatesInTime } = require('../../utils/getTimeDiff');
const dayjs = require('dayjs');


module.exports = {
    
    createTranspoter:()=>{

        return  nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ala.romdhani@esprit.tn',
              pass: 'ouma@ala.com'
            }
        })
    },
    messageGenerator:(type,message)=>{
        if(type==='ACCOUNT_ACTIVATION'){

           return {subject: 'Activate Your MADAR Account',
           html: `<h1>Bienvenue sur www.madar.tn,  </h1><p> ${message} </p> `
           } 
        }
      

    },
    sendEmail:async (data)=>{
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ala.romdhani@esprit.tn',
              pass: 'ouma@ala.com'
            }
        })
        let message = sails.services.emailservice.messageGenerator(data.type,data.message)
        const mailOptions = {
            from: 'ala.romdhani@esprit.tn',
            to: data.reciever,
            subject: message.subject,
            html: message.html
        };
        return new Promise((resolve,reject)=>{
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    
                 return reject(error) 
                } else {
                    return resolve(info)
                }
            });
        })



    },
    sendPasswordNotification:(auth,callback)=>{
        let time = ""
        let expiredTime = getDifferenceOfTwoDatesInTime(dayjs(),dayjs(new Date(auth.expiredTimeOfResetPasswordCode)))
        console.log(expiredTime)
        if(expiredTime.hours){
            time+=expiredTime.hours+" hours"
        }
        if(expiredTime.minutes){
            time+=expiredTime.minutes+" minutes"
        }
        if(expiredTime.seconds){
            time+=expiredTime.seconds+" seconds"
        }

        // console.log(new Date(auth.expiredTimeOfResetPasswordCode))
        const mailOptions = {
            from: 'ala.romdhani@esprit.tn',
            to: 'ala.rom0311@gmail.com',
            subject: 'Code De Validation MADAR',
            html: '<h1>this link will be expired in'+time+'</h1><a href="https://exemple.com/forgetpass/'+auth.resetPasswordCode+'"> verification link </a> '
        };
       transporter.sendMail(mailOptions, (error, info) => {
            if (error) {

             callback(error,null)
            } else {
                callback(null,info.response)
            }
        }); 


    }



}