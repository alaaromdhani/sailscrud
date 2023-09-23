
const bodyParser = require('body-parser');
const serveStatic = require('serve-static')

const expressSession = require('../../node_modules/sails/node_modules/express-session');
const databaseCredentials = require('../../utils/constants');
const sessionStore = require('express-session-sequelize')(expressSession.Store)
const {initConnections,datastores,Sequelize} = require('../../utils/sequelize');
const path = require('path');
let connections = initConnections()
let sequelizeSessionStore = new sessionStore({
  db:connections['default'],
})
module.exports = {
//  port:8008,
  datastores:datastores,



  models: {

    migrate: 'alter',



  },



  blueprints: {
    shortcuts: false,
  },




  security: {

    cors: {
      allRoutes: true,
      allowCredentials: true, // Allows cookies and session through CORS from here
      allowOrigins: databaseCredentials.allowedUrlOnCors, // Allows these origins through CORS
      allowResponseHeaders: 'set-cookie',
      allowRequestHeaders: 'content-type,cookie,Cookie' // I don't think this is necessary but I'm going crazy
    },

  },




  session: {
    name:'__session.id__',
    secret: '7c9b93a38b567fe0836335056ccb3bb8',
    resave: false,
    saveUninitialized: true,
   



  },



 
  sockets: {
    onlyAllowOrigins: ["http://www.mydeployedapp.com", "http://mydeployedapp.com"]
  
  },



  log: {
    level: 'debug'
  },



  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000, // One year
    middleware: {
      bodyParser:(()=>{
        const octetStreamOptions  ={
          inflate: true,
          limit: '100kb',
          type: 'application/octet-stream'
      } 
    

    return (req,res,next)=>{
        if(req.headers['content-type']=='application/octet-stream'){
          const octetStreamBodyParser = bodyParser.raw(octetStreamOptions)
            console.log('octet stream body')
            return octetStreamBodyParser(req,res,next)
        }
        else{
        
          return bodyParser()(req,res,next)
        }
    }


    })(),
    statics:(()=>{
      return function(req,res,next){
       
        
        
        function setCustomCacheControl (res, path) {
          if (serveStatic.mime.lookup(path) === 'text/html') {
            // Custom Cache-Control for HTML files
            res.setHeader('Cache-Control', 'public, max-age=0')
          }
        }

        return serveStatic(path.join(__dirname, '../../static'), {
          maxAge: '1d',
          setHeaders: setCustomCacheControl
        })(req,res,next)
      }


  })(),
    ex_session:(()=>{
      return function(req,res,next){
          console.log('req usest is ')
        return expressSession({
          secret: 'hhh try-hack-me',
          resave: false,
          saveUninitialized: true,
          store:sequelizeSessionStore,
          cookie:{
            httpOnly: false,
            sameSite:'none',
            secure:sails.config.environment==="production"
          }
          
        })(req,res,next)
      }



    })(),


    order: [
      'cookieParser',
      'ex_session',
        'statics',
      'bodyParser',
    //   'compress',
    //   'poweredBy',
    //   'router',

    //   'favicon',
    ],




   },

    trustProxy: true,
    customMiddleware: function(app) {
                 app.set('trust proxy', true)
     },


  },



  custom: {
    classrooms:{
      max_per_teacher:3
    },
    softskills:{
      nb_paid_tremestres:2
    },
    others:{
      nb_paid_tremestres:2
    },
    serie:{
      name:'madar',
      path:'seeders/default_serie.jpg'
    },
    security:{
      recaptcha:{
        key:'6LfzbI0nAAAAAJVjT9_5O40dEwPsWT9G5NtJhXJ7'
      }
    },
    database:{
      connections,
      session:{
        store:sequelizeSessionStore
      },
      sequelize:Sequelize
    },
    payment:{
      username:'1160070015',
      password:'pFym63C9',
      returnUrl:'http://localhost:3000/payment-success',
      failUrl:'http://localhost:3000/payment-error',
      expiredDate:20

    },
    remises:{
      1:0,
      2:10,
      3:20
    },

    nb_chapitres:30,
    roles:{
      superadmin:{
        name:'superadmin',
        weight:1,
        dashboardUser:true
      },
        intern_teacher:{
          name:'MadarTeacher',
          weight:10,
          dashboardUser:true
        },
        inspector:{
          name:'MadarInspector',
          weight:5,
          dashboardUser:true
        },
        student:{
          name:'Student',
          weight:30,
          dashboardUser:false
        },
        parent:{
          name:'Parent',
          weight:500,
          dashboardUser:false
        },
        teacher:{
          name:'Teacher',
          weight:400,
          dashboardUser:false
        },
        seller:{
          name:'Seller',
          weight:60,
          dashboardUser:true
        }
    },
    dafault_user_image:{
      file_name:'default',
      extension:'png',
      path: 'default',

    },
    lrsEndPoint:databaseCredentials.baseUrl+"lrs/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a",
    lrsOtherPoint:databaseCredentials.baseUrl+"lrs/other/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a",
    baseUrl: databaseCredentials.baseUrl,
    internalEmailAddress: databaseCredentials.internalEmailAddress,

    jwt:{
      jwt_secret:'super-secret-key',
      expires:3*24*3600

    },
    resetPassword:{
      expires:3//in minutes,

    },
    otpconf:{
      activationCode:{
        maxSend:3,
        maxRetry:3,
      },
      expires:{
        value:3,
        unit:'minute'
      },
      resend:{
        time:{
          value:1,
          unit:'minute'
        }
      }
      //m for minutes h for hours D for days W for week 
      /*authorization_header:'Basic TG5yZFFaU09Ca2I2NVZQeHU1QUdkRmFvcDFSQTY2a1E6YUpzVERNbmhBR3BQQVR1eA==',
      sender:'2160000'*/

    },
    ratings:{
        maxValue:5,
        minValue:0
    },

    files:{
      extensions:{
        images:['gif','png','jpg','jpeg','webp','svg','ico'],
        videos:['mp4','avi','mov','webm'],
        doc:['doc','docx','pdf','ppt','pptx'],
        audio:['mp3'],
        presentation:['ppt', 'pptx'],
        zipfiles:['zip']
      },
      maxSize:300000000,
      routes:{ //after assets
        public:'v/public/',
        private:'v/uploads/'
      }
    },

  },



};

