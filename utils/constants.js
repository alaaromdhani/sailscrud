
const databaseCredentials = {
  user:'root',
  password:'',

  options:{
    port:'3306',
    dialect:'mysql',
    host:'localhost',
            KeepAlive: 300000,
            KeepAliveQuery: 'SELECT 1',
  },
  database:'madar',
  baseUrl:'https://api.madar.tn/',
  allowedUrlOnCors: ['https://madar-landing-page.vercel.app','https://www.madar.tn','https://madar.tn','https://www.office.madar.tn','https://office.madar.tn'],
  internalEmailAddress: 'support@example.com',
  registrationCode:'454568789742558',
  frontUrl:'https://madar.tn'



}

module.exports = databaseCredentials