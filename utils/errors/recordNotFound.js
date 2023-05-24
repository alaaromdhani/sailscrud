function RecordNotFoundErr (err) {
    this.code = 'RECORD NOT Found';
    this.status = 404;
    this.message = 'the record you are looking for is not found';
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