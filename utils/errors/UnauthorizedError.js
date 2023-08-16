function UnauthorizedError (err,connection) {
    this.code = 'أنت غير مصرح لك للوصول إلى هذا المورد';
    this.status = 403;
    this.message = 'أنت غير مصرح لك للوصول إلى هذا المورد';
    this.lockout = (connection==true)?{specific:'connection'}:err;
}
UnauthorizedError.prototype.toJSON =
function () {
var obj = {
    code: this.code,
    status: this.status,
    message: this.message,
    lockout: this.lockout,
};

return obj;
};  
module.exports = UnauthorizedError