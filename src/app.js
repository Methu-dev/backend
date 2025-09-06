require('dotenv').config()
const morgan = require("morgan");
const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const { globallErorrhendler } = require('./helpers/globallErorrhendler');
const app = express();

// all globall middleware
if (process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}else{
    app.use(morgan("short"))
}
 app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors())


//routes
app.use('/api/v1', require('./routes/index.api'))

// globall error handeling middleware
app.use(globallErorrhendler)

module.exports = {app}