const chalk = require('chalk');
const mongoose = require('mongoose');
require('dotenv').config();
exports.connectDatabase = async ()=>{
    try {
        const dbinfo = await mongoose.connect(`${process.env.MONGODB_URL}/clicon`);
        console.log(
          chalk.bgYellow(
            `Database connection seccessfull ${dbinfo.connection.host}`
          )
        );
    } catch (error) {
        console.log(chalk.bgRed("Database connection failed", error));
    }
}