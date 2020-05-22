
class AppError extends Error{

    constructor(message, statusCode){
        super(message)

        this.statusCode =statusCode
        this.status =`${statusCode}`.startsWith('4') ? "fail":"error";
        // WE set operational errors for errors that we handled
        this.isOperationalError = true

        Error.captureStackTrace(this,this.constructor)

    }
}

module.exports = AppError