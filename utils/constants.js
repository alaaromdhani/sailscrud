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
      lrsEndPoint:'http://localhost:1337/lrs/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a',
      lrsOtherPoint:'http://localhost:1337/lrs/other/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a',
       allowedUrlOnCors: ['http://localhost:3000','http://localhost:4200', 'http://127.0.0.1:3000', 'http://127.0.0.1'],
      internalEmailAddress: 'support@example.com',
   



}
module.exports = databaseCredentials