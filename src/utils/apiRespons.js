class apiRespons {
    constructor(message, statusCode, data){
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.status = statusCode >= 200 && statusCode < 300 ? "ok" : "Erorr";

    }
    static sendSuccess(res, statusCode, message, data){
        return res
          .status(statusCode)
          .json(new apiRespons(message, statusCode, data));
    }
}

module.exports = {apiRespons};