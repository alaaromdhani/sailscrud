const UnauthorizedError = require("./UnauthorizedError")
const UnkownError = require("./UnknownError")
const RecordNotFoundErr = require("./recordNotFound")
const SqlError = require("./sqlErrors")
const ValidationError = require("./validationErrors")

module.exports = (e)=>{
  return   (e instanceof RecordNotFoundErr || e instanceof UnauthorizedError|| e instanceof ValidationError || e instanceof RecordNotFoundErr ||e instanceof UnkownError)? e:new SqlError(e) 
       
}