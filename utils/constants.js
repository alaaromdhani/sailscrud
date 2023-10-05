

const databaseCredentials = {
      user:'root',
      password:'',
  
      options:{
        port:'3306',
        dialect:'mysql',
        host:'localhost',
      },
      database:'madar',
      baseUrl:'http://localhost:1337/',
      allowedUrlOnCors: ['http://localhost:3000','https://madar-landing-page.vercel.app','http://localhost:4200', 'http://127.0.0.1:3000', 'http://127.0.0.1','http://127.0.0.1:3001','http://localhost:3001'],
      internalEmailAddress: 'support@example.com',
      registrationCode:'454568789742558',
      frontUrl:'http://localhost:3000'



}

module.exports = databaseCredentials