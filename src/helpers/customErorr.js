class customError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.status =
      statusCode >= 400 && statusCode < 500 ? "Client Error" : "server Error";
    this.statusCode = statusCode || 500;
    this.message = message || "erorr occured try again !!";
    this.isOperationalError =
      statusCode >= 400 && statusCode < 500 ? false : true;
    this.date = null;
    this.stack;
  }
}

module.exports = { customError };