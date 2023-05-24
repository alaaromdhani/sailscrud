const session = require('express-session');
const http = require('http');
//const express = require('express')


module.exports = (req,res,next)=>{
   
    const passport = sails.services.passport
   

    passport.initialize()(req, res, function () {
        
        // Use the built-in sessions
        passport.session()(req, res, function () {
            
                
                next()
          
        });
      });

      
    
}