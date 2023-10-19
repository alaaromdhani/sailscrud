
const bodyParser = require('body-parser');
const serveStatic = require('serve-static')
const databaseCredentials = require('../../utils/constants');
const {datastores} = require('../../utils/sequelize');
const path = require('path');



module.exports = {
  datastores:datastores,
    
 



  models: {

    migrate: 'safe',


  },
    



  blueprints: {
    shortcuts: false,
  },



  security: {
   cors: {
      allRoutes: true,
      allowCredentials: true, // Allows cookies and session through CORS from here
      allowOrigins: ['http://127.0.0.1:5500','http://localhost:5500','http://localhost:3000','https://madar-landing-page.vercel.app','http://localhost:4200', 'http://127.0.0.1:3000', 'http://127.0.0.1','http://localhost:3001'], // Allows these origins through CORS
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
          console.log('json content')
          return bodyParser()(req,res,next)
        }
    }


    })(),
    statics:(()=>{
       
        console.log('setting static files')
        return async function(req,res,next){
          if(req.headers && req.headers.accept && req.headers.accept.includes('text/html')){
            console.log(req.url)
            
         }
          
            function setCustomCacheControl (res, path) {
              if (serveStatic.mime.lookup(path) === 'text/html') {
                res.setHeader('Cache-Control', 'public, max-age=0')
              }
            }
            return serveStatic(path.join(__dirname, '../../static'), {
              maxAge: '1m',
              setHeaders: setCustomCacheControl
            })(req,res,next)
          
        }


    })(),
    ex_session:(()=>{
      return function(req,res,next){
         let {databaseSessionStore,expressSession} = require('../../utils/sequelize/DatabaseSession')
        return expressSession({
          secret: 'hhh try-hack-me',
          resave: false,
          saveUninitialized: true,
          store:databaseSessionStore,
          cookie:{
            //httpOnly: false,
       //  sameSite:'none',
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
    lrsStudentEndPoint:databaseCredentials.baseUrl+"lrs/student/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a",
    
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
    /*courses:{
      interactive:{
        files:['story.html','analytics-frame.html','meta.html']

      }
    }*/

    // sendgridSecret: 'SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU',
    // stripeSecret: 'sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking them in to version control, you might opt to
    // ||   set sensitive credentials like these using environment variables.
    //
    // For example:
    // ```
    // sendgridSecret=SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU
    // sails_custom__stripeSecret=sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm
    // ```
    //--------------------------------------------------------------------------

  },
  }




