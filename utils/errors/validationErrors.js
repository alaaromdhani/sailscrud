function ValidationError (error) {
        let message = ""
        let extrafields =[]
        if(error.message && typeof(error.message)=='string'){
            message = "error with input"        
            if(error.message.includes('must be')){
                extrafields.push(error.message.split('must be')[0])    
            }
            if(error.message.endsWith('is required')){
                extrafields.push(error.message.split('is required')[0])
            }
                    
        }
        this.code = 'validation Error';
        this.status = 400;
        this.message = message;
        this.lockout = error;
        this.extrafields = extrafields
}
ValidationError.prototype.toJSON =
    function () {
    var obj = {
        code: this.code,
        status: this.status,
        message: this.message,
        extrafields: this.extrafields,
        lockout: this.lockout,
    };

    return obj;
};  
module.exports = ValidationError