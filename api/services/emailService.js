const nodemailer = require('nodemailer');
const { getDifferenceOfTwoDatesInTime } = require('../../utils/getTimeDiff');
const dayjs = require('dayjs');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ala.romdhani@esprit.tn',
      pass: 'ouma@ala.com'
    }
})
module.exports = {
    

    
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