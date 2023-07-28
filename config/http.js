/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */
const bodyParser = require('body-parser')
const express = require('express');
const databaseCredentials = require('../utils/constants')
const path = require('path');
const Sequelize = require('sequelize')
const expressSession = require('../node_modules/sails/node_modules/express-session')
const sessionStore = require('express-session-sequelize')(expressSession.Store)
const connection = new Sequelize(databaseCredentials.database, databaseCredentials.user, databaseCredentials.password, {
  host: databaseCredentials.options.host,
  dialect: databaseCredentials.options.dialect,
});
let sequelizeSessionStore = new sessionStore({
  db:connection

})
module.exports.http = {
    
  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

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

};
