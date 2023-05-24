function UnauthorizedError (err) {
    this.code = 'Unauthorized error';
    this.status = 403;
    this.message = 'you are not authorized to access this  ressourse';
    this.lockout = err;
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