const { connectDatabase } = require('./src/database/db');
const {app} = require('./src/app')
require('dotenv');
const chalk = require("chalk");

connectDatabase().then(()=>{
 app.listen(process.env.PORT || 4000, ()=>{
    console.log(
      chalk.bgGreen(`server is running on http://localhost:${process.env.PORT}`)
    );
 });
}).catch((error)=>{
    console.log('database connection failed', error)
})