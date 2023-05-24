
/**
 * UserAuthSettings.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const {DataTypes} = require('sequelize');
const bcrypt = require('bcrypt')
const { getDifferenceOfTwoDatesInTime } = require('../../utils/getTimeDiff');
const dayjs = require('dayjs');
const {SAPassportLockedError} = require('../../utils/errors/lockedError');
module.exports = {
  options: {
    tableName: 'UserAuthSettings',
    classMethods:{
        /**
           * Validate password used by the local strategy.
           *
           * @param {string}   password The password to validate
           * @param {string}   userPassword the user Password
           * @param {Function} next
           */
        validatePassword:(auth,password,userPassword,next)=>{
         
          UserAuthSettings.isLocked(auth).then(()=>{
              return bcrypt.compare(password,userPassword)
          }).then((result)=>{
           
            let data = {
              loginRetryLimit: 0,
              loginReactiveTime: null
            };
            if(!result){
                const maxAttemps = sails.config.auth.lockout.attempts 
                if(auth.loginRetryLimit>=maxAttemps){
                    data.loginRetryLimit = 0
                    data.loginReactiveTime = dayjs().add(30,"second")
                }else{
                  data.loginRetryLimit = auth.loginRetryLimit+1
                  data.loginReactiveTime = null
                }
            }
            auth.loginReactiveTime = data.loginReactiveTime
            auth.loginRetryLimit = data.loginRetryLimit
            var updateSettings = auth.save()
            return Promise.all([result,updateSettings])
          }).then(results=>{
            var authenticated = results[0];
              var settings = results[1];
              
              next(null,authenticated)


          }).catch(e=>{
            
            next(e)
          })        





        },
        isLocked:(auth)=>{

          return new Promise((resolve, reject) => {

            // is passport locked out?
            if (auth.loginReactiveTime) {

              try {
                var dateNow = new Date();
                var loginReactiveTime = new Date(auth.loginReactiveTime);
              } catch (e) {
                return reject(e);
              }

              // lockout still in effect?
              if (dateNow < loginReactiveTime) {
                
                // still locked out
                //var error = 'this account will be unlocked for '+getDifferenceOfTwoDatesInTime(dayjs(),dayjs(loginReactiveTime))
                var error = new SAPassportLockedError({
                 
                  expires: getDifferenceOfTwoDatesInTime(dayjs(),dayjs(loginReactiveTime)),
                  
                });

                return reject(error);
              }

            }
            return resolve()

            

          });


        }


    }
  },
  attributes: {
    id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },
    expiredTimeOfResetPasswordCode:{ type:DataTypes.DATE },
    loginRetryLimit:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    isActive:{ type:DataTypes.BOOLEAN },
    loginReactiveTime:{ type:DataTypes.DATE },
    isDeleted:{ type:DataTypes.BOOLEAN },
    

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },
  associations:()=>{

    UserAuthSettings.belongsTo(User,{
      foreignKey:'user_id',
      targeKey:'id'


    })

   


  },
  
 



};

