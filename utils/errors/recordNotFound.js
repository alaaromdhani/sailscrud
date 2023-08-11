function RecordNotFoundErr (err) {
    this.code = 'السجل الذي تبحث عنه غير موجود';
    this.status = 404;
    this.message = 'السجل الذي تبحث عنه غير موجود';
    this.lockout = err;
}
RecordNotFoundErr.prototype.toJSON =
function () {
var obj = {
    code: this.code,
    status: this.status,
    message: this.message,
    lockout: this.lockout,
};

return obj;
};  
module.exports = RecordNotFoundErr