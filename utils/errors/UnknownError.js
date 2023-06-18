function UnkownError () {
  this.code = 'Unkown Error';
  this.status = 500;
  this.message = 'some error accured come back later';
  this.lockout = 'some error accured come back later';
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
