const util = require('util')
/**
 * SAPassportLockedError
 *
 * @param  {Object} properties
 * @constructor {SAPassportLockedError}
 */
function SAPassportLockedError (lockout) {
    let m ="سيتم فتح حسابك في" 
    let extra = []
    if(lockout.expires.seconds){
      m +=" ثواني"  
      extra.push(lockout.expires.seconds)
    }
    if(lockout.expires.minutes){
      m +=" دقائق"
      extra.push(lockout.expires.minutes)
    }
    if(lockout.expires.hours){
      m +=" ساعات"
      extra.push(lockout.expires.hours)
    }
    

    this.code = 'E_ACCOUNT_LOCKED',
    this.extrafields=extra,
    this.status = 403;
    this.message =m;
    this.lockout = lockout;
}
  
  util.inherits(SAPassportLockedError, Error);
  
  SAPassportLockedError.prototype.toJSON =
    function () {
      var obj = {
        
        code: this.code,
        status: this.status,
        extrafields:this.extrafields,
        message: this.message,
        lockout: this.lockout,
      };
  
      return obj;
    };
    
function BadCredentialsError (lockout) {
    this.code = 'بيانات غير صحيحة';

    this.status = 403;
    this.message = `بيانات غير صحيحة`;
    this.lockout = lockout;
}  
util.inherits(BadCredentialsError, Error);
  
BadCredentialsError.prototype.toJSON =
    function () {
    var obj = {
        code: this.code,
        
        status: this.status,
        message: this.message,
        lockout: this.lockout,
    };

    return obj;
};
  
  
  module.exports = {SAPassportLockedError,BadCredentialsError};
  