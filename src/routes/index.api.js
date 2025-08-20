const express = require('express');
const _ = express.Router();
_.use('/auth', require('./api/user.api'))
_.use('/category', require('./api/cetegory.api'))
module.exports = _;