const { UniqueConstraintError } = require("sequelize");

function SqlError (error) {
    if (error instanceof UniqueConstraintError) {
        this.code = 'UNIQUE CONTRAINT ERROR';
        this.status = 401;
        this.message = `is already used`;
        this.extrafields = [error.parent.sqlMessage.split("pour la clef ")[error.parent.sqlMessage.split("pour la clef ").length-1]]
        this.lockout = error;
    } else {
        this.code = 'SQL ERROR';
        this.status = 500;
        this.extrafields = []
        this.message = `some error accured `;
        this.lockout = error;
    }
 
}
SqlError.prototype.toJSON =
    function () {
    var obj = {
        code: this.code,
        status: this.status,
        extrafields: this.extrafields,    
        message: this.message,
        lockout: this.lockout,
    };

    return obj;
};  
module.exports = SqlError