function UnkownError () {
  this.code = 'حدث خطأ ما اتصل بمدير مدار';
  this.status = 500;
  this.message = 'حدث خطأ ما اتصل بمدير مدار';
  this.lockout = 'حدث خطأ ما اتصل بمدير مدار';
}
UnkownError.prototype.toJSON =
function () {
  var obj = {
    code: this.code,
    status: this.status,
    message: this.message,
    lockout: this.lockout,
  };

  return obj;
};
module.exports = UnkownError;
