const developarErorr = (error, res) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    isOperationalError: error.isOperationalError,
    data: error.data,
    errorTraceStack: error.stack,
  });
};

const productionErorr = (error, res) => {
  const statusCode = error.statusCode || 500;
  if (error.isOperationalError) {
    return res.status(statusCode).json({
      message: error.message,
      status: error.status,
    });
  } else {
     return res.status(500).json({
       message: "server failed try again"
     });
  }
};

exports.globallErorrhendler = (error, req, res, next) => {
  if (process.env.NODE_ENV == "development") {
    developarErorr(error, res);
  }else{
    productionErorr(error, res);
  }
};
