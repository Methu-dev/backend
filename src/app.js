require('dotenv').config()
const morgan = require("morgan");
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const http = require('http')
const { globallErorrhendler } = require('./helpers/globallErorrhendler');
const { initSocket } = require('./socket/server');
const app = express();

// make a node serber using express
const server = http.createServer(app);
// all globall middleware
if (process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}else{
    app.use(morgan("short"))
}
 app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);


//routes
app.use('/api/v1', require('./routes/index.api'))

const io = initSocket(server);

// globall error handeling middleware
app.use(globallErorrhendler)

module.exports = { server, io };