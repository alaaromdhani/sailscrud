/**
 * Production environment settings
 * (sails.config.*)
 *
 * What you see below is a quick outline of the built-in settings you need
 * to configure your Sails app for production.  The configuration in this file
 * is only used in your production environment, i.e. when you lift your app using:
 *
 * ```
 * NODE_ENV=production node app
 * ```
 *
 * > If you're using git as a version control solution for your Sails app,
 * > this file WILL BE COMMITTED to your repository by default, unless you add
 * > it to your .gitignore file.  If your repository will be publicly viewable,
 * > don't add private/sensitive data (like API secrets / db passwords) to this file!
 *
 * For more best practices and tips, see:
 * https://sailsjs.com/docs/concepts/deployment
 */
const bodyParser = require('body-parser');

const express = require('../../node_modules/sails/node_modules/express');
const path = require('path');
const Sequelize = require('sequelize')
const expressSession = require('../../node_modules/sails/node_modules/express-session');
const databaseCredentials = require('../../utils/constants');
const sessionStore = require('express-session-sequelize')(expressSession.Store)
const connection = new Sequelize(databaseCredentials.database, databaseCredentials.user, databaseCredentials.password, {
  host: databaseCredentials.options.host,
  dialect: databaseCredentials.options.dialect,
});
let sequelizeSessionStore = new sessionStore({
  db:connection

})
module.exports = {
  //cron : {
  //  login: {
  // schedule: '* */30 * * * *',      // [REQUIRED]
  //  onTick: () => {               // [REQUIRED]
  // sails.services.otpservice.login();
  //},
  // timezone: 'America/New_York', // [OPTIONAL] set timezone
  //  runOnInit: true,              // [OPTIONAL] fire onTick function as soon as the cron is initialized
  // start: true                   // [OPTIONAL] manually start the cron task (DEFAULT = true) See below for the example
  //  },

  //},


  /**************************************************************************
    *                                                                         *
    * Tell Sails what database(s) it should use in production.                *
    *                                                                         *
    * (https://sailsjs.com/config/datastores)                                 *
    *                                                                         *
    **************************************************************************/
  datastores: {

    /***************************************************************************
      *                                                                          *
      * Configure your default production database.                              *
      *                                                                          *
      * 1. Choose an adapter:                                                    *
      *    https://sailsjs.com/plugins/databases                                 *
      *                                                                          *
      * 2. Install it as a dependency of your Sails app.                         *
      *    (For example:  npm install sails-mysql --save)                        *
      *                                                                          *
      * 3. Then set it here (`adapter`), along with a connection URL (`url`)     *
      *    and any other, adapter-specific customizations.                       *
      *    (See https://sailsjs.com/config/datastores for help.)                 *
      *                                                                          *
      ***************************************************************************/
 //   sails-crud.czipie0umpys.eu-west-2.rds.amazonaws.com
 //faroukallani
    default: {
      user:databaseCredentials.user,
      password:databaseCredentials.password,
  
      options:{
        
          port:databaseCredentials.options.port,
          dialect:databaseCredentials.options.dialect,
          host:databaseCredentials.options.host,
        


      },
      database:databaseCredentials.database
  
      /***************************************************************************
      *                                                                          *
      * Want to use a different database during development?                     *
      *                                                                          *
      * 1. Choose an adapter:                                                    *
      *    https://sailsjs.com/plugins/databases                                 *
      *                                                                          *
      * 2. Install it as a dependency of your Sails app.                         *
      *    (For example:  npm install sails-mysql --save)                        *
      *                                                                          *
      * 3. Then pass it in, along with a connection URL.                         *
      *    (See https://sailsjs.com/config/datastores for help.)                 *
      *                                                                          *
      ***************************************************************************/
      // adapter: 'sails-mysql',
      // url: 'mysql://user:password@host:port/database',
  
    },
  },



  models: {

    /***************************************************************************
      *                                                                          *
      * To help avoid accidents, Sails automatically sets the automigration      *
      * strategy to "safe" when your app lifts in production mode.               *
      * (This is just here as a reminder.)                                       *
      *                                                                          *
      * More info:                                                               *
      * https://sailsjs.com/docs/concepts/models-and-orm/model-settings#?migrate *
      *                                                                          *
      ***************************************************************************/
    migrate: 'safe',

    /***************************************************************************
      *                                                                          *
      * If, in production, this app has access to physical-layer CASCADE         *
      * constraints (e.g. PostgreSQL or MySQL), then set those up in the         *
      * database and uncomment this to disable Waterline's `cascadeOnDestroy`    *
      * polyfill.  (Otherwise, if you are using a databse like Mongo, you might  *
      * choose to keep this enabled.)                                            *
      *                                                                          *
      ***************************************************************************/
    // cascadeOnDestroy: false,

  },



  /**************************************************************************
    *                                                                         *
    * Always disable "shortcut" blueprint routes.                             *
    *                                                                         *
    * > You'll also want to disable any other blueprint routes if you are not *
    * > actually using them (e.g. "actions" and "rest") -- but you can do     *
    * > that in `config/blueprints.js`, since you'll want to disable them in  *
    * > all environments (not just in production.)                            *
    *                                                                         *
    ***************************************************************************/
  blueprints: {
    shortcuts: false,
  },



  /***************************************************************************
    *                                                                          *
    * Configure your security settings for production.                         *
    *                                                                          *
    * IMPORTANT:                                                               *
    * If web browsers will be communicating with your app, be sure that        *
    * you have CSRF protection enabled.  To do that, set `csrf: true` over     *
    * in the `config/security.js` file (not here), so that CSRF app can be     *
    * tested with CSRF protection turned on in development mode too.           *
    *                                                                          *
    ***************************************************************************/
  security: {

    /***************************************************************************
      *                                                                          *
      * If this app has CORS enabled (see `config/security.js`) with the         *
      * `allowCredentials` setting enabled, then you should uncomment the        *
      * `allowOrigins` whitelist below.  This sets which "origins" are allowed   *
      * to send cross-domain (CORS) requests to your Sails app.                  *
      *                                                                          *
      * > Replace "https://example.com" with the URL of your production server.  *
      * > Be sure to use the right protocol!  ("http://" vs. "https://")         *
      *                                                                          *
      ***************************************************************************/
    cors: {
      allRoutes: true,
      allowCredentials: true, // Allows cookies and session through CORS from here
      allowOrigins: databaseCredentials.allowedUrlOnCors, // Allows these origins through CORS
      allowResponseHeaders: 'set-cookie',
      allowRequestHeaders: 'content-type,cookie,Cookie' // I don't think this is necessary but I'm going crazy
    },

  },



  /***************************************************************************
    *                                                                          *
    * Configure how your app handles sessions in production.                   *
    *                                                                          *
    * (https://sailsjs.com/config/session)                                     *
    *                                                                          *
    * > If you have disabled the "session" hook, then you can safely remove    *
    * > this section from your `config/env/production.js` file.                *
    *                                                                          *
    ***************************************************************************/
  session: {
    name:'__session.id__',
    secret: '7c9b93a38b567fe0836335056ccb3bb8',
    resave: false,
    saveUninitialized: true,
   

    /***************************************************************************
      *                                                                          *
      * Production session store configuration.                                  *
      *                                                                          *
      * Uncomment the following lines to finish setting up a package called      *
      * "@sailshq/connect-redis" that will use Redis to handle session data.     *
      * This makes your app more scalable by allowing you to share sessions      *
      * across a cluster of multiple Sails/Node.js servers and/or processes.     *
      * (See http://bit.ly/redis-session-config for more info.)                  *
      *                                                                          *
      * > While @sailshq/connect-redis is a popular choice for Sails apps, many  *
      * > other compatible packages (like "connect-mongo") are available on NPM. *
      * > (For a full list, see https://sailsjs.com/plugins/sessions)            *
      *                                                                          *
      ***************************************************************************/
    // adapter: '@sailshq/connect-redis',
    // url: 'redis://user:password@localhost:6379/databasenumber',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking it in to version control, you might opt to
    // ||   set sensitive credentials like this using an environment variable.
    //
    // For example:
    // ```
    // sails_session__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
    // ```
    //
    //--------------------------------------------------------------------------

    /***************************************************************************
      *                                                                          *
      * Production configuration for the session ID cookie name.                 *
      *                                                                          *
      * We reccomend prefixing your session cookie with `__Host-`, this limits   *
      * the scope of your cookie to a single origin to protect against same-site *
      * attacks.                                                                 *
      *                                                                          *
      * Note that with the `__Host-` prefix, session cookies will _not_ be sent  *
      * unless `sails.config.cookie.secure` is set to `true`.                    *
      *                                                                          *
      * Read more:                                                               *
      * https://sailsjs.com/config/session#?the-session-id-cookie                *
      *                                                                          *
      ***************************************************************************/
    // name: '__Host-sails.sid',

    /***************************************************************************
      *                                                                          *
      * Production configuration for the session ID cookie.                      *
      *                                                                          *
      * Tell browsers (or other user agents) to ensure that session ID cookies   *
      * are always transmitted via HTTPS, and that they expire 24 hours after    *
      * they are set.                                                            *
      *                                                                          *
      * Note that with `secure: true` set, session cookies will _not_ be         *
      * transmitted over unsecured (HTTP) connections. Also, for apps behind     *
      * proxies (like Heroku), the `trustProxy` setting under `http` must be     *
      * configured in order for `secure: true` to work.                          *
      *                                                                          *
      * > While you might want to increase or decrease the `maxAge` or provide   *
      * > other options, you should always set `secure: true` in production      *
      * > if the app is being served over HTTPS.                                 *
      *                                                                          *
      * Read more:                                                               *
      * https://sailsjs.com/config/session#?the-session-id-cookie                *
      *                                                                          *
      ***************************************************************************/


  },



  /**************************************************************************
    *                                                                          *
    * Set up Socket.io for your production environment.                        *
    *                                                                          *
    * (https://sailsjs.com/config/sockets)                                     *
    *                                                                          *
    * > If you have disabled the "sockets" hook, then you can safely remove    *
    * > this section from your `config/env/production.js` file.                *
    *                                                                          *
    ***************************************************************************/
  sockets: {

    /***************************************************************************
      *                                                                          *
      * Uncomment the `onlyAllowOrigins` whitelist below to configure which      *
      * "origins" are allowed to open socket connections to your Sails app.      *
      *                                                                          *
      * > Replace "https://example.com" etc. with the URL(s) of your app.        *
      * > Be sure to use the right protocol!  ("http://" vs. "https://")         *
      *                                                                          *
      ***************************************************************************/
    onlyAllowOrigins: [
      'http://localhost:8100',

    ],
    beforeConnect: function(handshake, proceed) {
      console.log('poceeed');
      // Send back `true` to allow the socket to connect.
      // (Or send back `false` to reject the attempt.)
      return proceed(undefined, true);

    },
    onConnect: function(session, socket) {
      console.log('new socket is coming');
      socket.emit('documents', 'ala');
      socket.on('my other event', (data) => {
        console.log(data);
      });
      // By default: do nothing
      // This is a good place to subscribe a new socket to a room, inform other users
      // that someone new has come online, or any other custom socket.io logic
    }


    /***************************************************************************
      *                                                                          *
      * If you are deploying a cluster of multiple servers and/or processes,     *
      * then uncomment the following lines.  This tells Socket.io about a Redis  *
      * server it can use to help it deliver broadcasted socket messages.        *
      *                                                                          *
      * > Be sure a compatible version of @sailshq/socket.io-redis is installed! *
      * > (See https://sailsjs.com/config/sockets for the latest version info)   *
      *                                                                          *
      * (https://sailsjs.com/docs/concepts/deployment/scaling)                   *
      *                                                                          *
      ***************************************************************************/
    // adapter: '@sailshq/socket.io-redis',
    // url: 'redis://user:password@bigsquid.redistogo.com:9562/databasenumber',
    //--------------------------------------------------------------------------
    // /\   OR, to avoid checking it in to version control, you might opt to
    // ||   set sensitive credentials like this using an environment variable.
    //
    // For example:
    // ```
    // sails_sockets__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
    // ```
    //--------------------------------------------------------------------------

  },



  /**************************************************************************
    *                                                                         *
    * Set the production log level.                                           *
    *                                                                         *
    * (https://sailsjs.com/config/log)                                        *
    *                                                                         *
    ***************************************************************************/
  log: {
    level: 'debug'
  },



  http: {

    /***************************************************************************
      *                                                                          *
      * The number of milliseconds to cache static assets in production.         *
      * (the "max-age" to include in the "Cache-Control" response header)        *
      *                                                                          *
      * If you are caching assets with a tool like Cloudflare, you may want to   *
      * reduce this considerably to allow more flexibility in purging the cache. *
      *                                                                          *
      ***************************************************************************/
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
        return function(req,res,next){
          return express.static(path.join(__dirname, '../static'))(req,res,next);
        }

    })(),
    ex_session:(()=>{
      console.log('the session hook for sails have been disaibled ...')
      return function(req,res,next){
          console.log('req usest is ')
        return expressSession({
          secret: 'hhh try-hack-me',
          resave: false,
          saveUninitialized: true,
          store:sequelizeSessionStore,
          cookie:{
            secure:sails.config.environment==="production"
          }
          
        })(req,res,next)
      }



    })(),

/***************************************************************************
*                                                                          *
* The order in which middleware should be run for HTTP requests.           *
* (This Sails app's routes are handled by the "router" middleware below.)  *
*                                                                          *
***************************************************************************/

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


/***************************************************************************
*                                                                          *
* The body parser that will handle incoming multipart HTTP requests.       *
*                                                                          *
* https://sailsjs.com/config/http#?customizing-the-body-parser             *
*                                                                          *
***************************************************************************/

// bodyParser: (function _configureBodyParser(){
//   var skipper = require('skipper');
//   var middlewareFn = skipper({ strict: true });
//   return middlewareFn;
// })(),

   },

    /***************************************************************************
      *                                                                          *
      * Proxy settings                                                           *
      *                                                                          *
      * If your app will be deployed behind a proxy/load balancer - for example, *
      * on a PaaS like Heroku - then uncomment the `trustProxy` setting below.   *
      * This tells Sails/Express how to interpret X-Forwarded headers.           *
      *                                                                          *
      * This setting is especially important if you are using secure cookies     *
      * (see the `cookies: secure` setting under `session` above) or if your app *
      * relies on knowing the original IP address that a request came from.      *
      *                                                                          *
      * (https://sailsjs.com/config/http)                                        *
      *                                                                          *
      ***************************************************************************/
    trustProxy: true,
    customMiddleware: function(app) {
                 app.set('trust proxy', true)
     },


  },



  /**************************************************************************
    *                                                                         *
    * Lift the server on port 80.                                             *
    * (if deploying behind a proxy, or to a PaaS like Heroku or Deis, you     *
    * probably don't need to set a port here, because it is oftentimes        *
    * handled for you automatically.  If you are not sure if you need to set  *
    * this, just try deploying without setting it and see if it works.)       *
    *                                                                         *
    ***************************************************************************/
  



  /**************************************************************************
    *                                                                         *
    * Configure an SSL certificate                                            *
    *                                                                         *
    * For the safety of your users' data, you should use SSL in production.   *
    * ...But in many cases, you may not actually want to set it up _here_.    *
    *                                                                         *
    * Normally, this setting is only relevant when running a single-process   *
    * deployment, with no proxy/load balancer in the mix.  But if, on the     *
    * other hand, you are using a PaaS like Heroku, you'll want to set up     *
    * SSL in your load balancer settings (usually somewhere in your hosting   *
    * provider's dashboard-- not here.)                                       *
    *                                                                         *
    * > For more information about configuring SSL in Sails, see:             *
    * > https://sailsjs.com/config/*#?sailsconfigssl                          *
    *                                                                         *
    **************************************************************************/
  // ssl: undefined,



  /**************************************************************************
    *                                                                         *
    * Production overrides for any custom settings specific to your app.      *
    * (for example, production credentials for 3rd party APIs like Stripe)    *
    *                                                                         *
    * > See config/custom.js for more info on how to configure these options. *
    *                                                                         *
    ***************************************************************************/
  custom: {
    nb_chapitres:30,
    roles:{
        teacher:{
          name:'MadarTeacher',
          weight:10
        },
        inspector:{
          name:'MadarInspector',
          weight:5
        }
    },
    dafault_user_image:{
      file_name:'default',
      extension:'png',
      path: 'default',

    },
    lrsEndPoint:databaseCredentials.lrsEndPoint,
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
      authorization_header:'Basic TG5yZFFaU09Ca2I2NVZQeHU1QUdkRmFvcDFSQTY2a1E6YUpzVERNbmhBR3BQQVR1eA==',
      sender:'2160000'

    },
    ratings:{
        maxValue:5,
        minValue:0
    },
    database:{
      credentials:{
        username:databaseCredentials.user,
        password:databaseCredentials.password,
        host:databaseCredentials.options.host,
        port:databaseCredentials.options.port,
        dialect:databaseCredentials.options.dialect,      
        database:databaseCredentials.database

      }
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
      maxSize:100000000,
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



};

